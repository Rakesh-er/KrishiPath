import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.js';
import { computeCompositeQualityScore, gradeFromScore } from '../lib/quality.js';

const router = express.Router();

router.post('/detect-anomaly', authMiddleware, async (req, res) => {
    try {
        const { batchId, description, quality } = req.body;

        let anomalyScore = 0;
        const flags = [];

        if (quality?.testResults?.qualityScore != null && quality.testResults.qualityScore < 70) {
            anomalyScore += 30;
            flags.push('Low quality score');
        }

        if (quality?.testResults?.pesticides === true) {
            anomalyScore += 50;
            flags.push('Pesticide residue detected');
        }

        if (process.env.OPENAI_API_KEY && description) {
            try {
                const openaiResponse = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-3.5-turbo',
                        messages: [{
                            role: 'user',
                            content: `Analyze this produce description for potential anomalies or quality issues: "${description}". Rate the anomaly risk from 0-100 and explain briefly.`
                        }],
                        max_tokens: 150
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const aiAnalysis = openaiResponse.data.choices[0].message.content;
                const aiScore = parseInt(aiAnalysis.match(/\d+/)?.[0] || '0', 10);

                if (aiScore > 70) {
                    anomalyScore += aiScore;
                    flags.push('AI detected potential quality issues');
                }
            } catch (aiError) {
                console.warn('OpenAI API unavailable, using rule-based detection only');
            }
        }

        const isAnomalous = anomalyScore > 70;

        res.json({
            batchId,
            isAnomalous,
            anomalyScore,
            flags,
            recommendation: isAnomalous ? 'Further inspection required' : 'Quality acceptable',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Anomaly detection error:', error);
        res.status(500).json({ message: 'Anomaly detection failed', error: error.message });
    }
});

router.post('/assess-quality', authMiddleware, async (req, res) => {
    try {
        const { batchId, metrics } = req.body;

        if (!metrics || typeof metrics !== 'object') {
            return res.status(400).json({ message: 'metrics object is required' });
        }

        const rawScore = computeCompositeQualityScore(metrics);
        const grade = gradeFromScore(rawScore);

        res.json({
            batchId,
            qualityScore: Math.round(rawScore),
            grade,
            metrics,
            assessment: rawScore >= 80 ? 'Premium Quality' : rawScore >= 60 ? 'Standard Quality' : 'Below Standard'
        });
    } catch (error) {
        console.error('Quality assessment error:', error);
        res.status(500).json({ message: 'Quality assessment failed', error: error.message });
    }
});

export default router;
