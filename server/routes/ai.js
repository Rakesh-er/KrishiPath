const express = require('express');
const axios = require('axios');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// AI Anomaly Detection
router.post('/detect-anomaly', authMiddleware, async (req, res) => {
    try {
        const { batchId, imageUrl, description, quality } = req.body;

        // Simple rule-based anomaly detection
        let anomalyScore = 0;
        const flags = [];

        // Quality checks
        if (quality.qualityScore < 70) {
            anomalyScore += 30;
            flags.push('Low quality score');
        }

        if (quality.pesticides === true) {
            anomalyScore += 50;
            flags.push('Pesticide residue detected');
        }

        // If OpenAI API is available, use it for advanced detection
        if (process.env.OPENAI_API_KEY && description) {
            try {
                const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: `Analyze this produce description for potential anomalies or quality issues: "${description}". Rate the anomaly risk from 0-100 and explain briefly.`
                    }],
                    max_tokens: 150
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                const aiAnalysis = openaiResponse.data.choices[0].message.content;
                const aiScore = parseInt(aiAnalysis.match(/\d+/)?.[0] || '0');

                if (aiScore > 70) {
                    anomalyScore += aiScore;
                    flags.push('AI detected potential quality issues');
                }
            } catch (aiError) {
                console.log('OpenAI API unavailable, using rule-based detection');
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
        res.status(500).json({ message: 'Anomaly detection failed', error: error.message });
    }
});

// Batch quality assessment
router.post('/assess-quality', authMiddleware, async (req, res) => {
    try {
        const { batchId, metrics } = req.body;

        // Calculate composite quality score
        const weights = {
            appearance: 0.3,
            freshness: 0.25,
            size: 0.15,
            contamination: 0.3
        };

        let qualityScore = 0;
        for (const [metric, value] of Object.entries(metrics)) {
            qualityScore += (weights[metric] || 0) * value;
        }

        const grade = qualityScore >= 90 ? 'A' : qualityScore >= 75 ? 'B' : 'C';

        res.json({
            batchId,
            qualityScore: Math.round(qualityScore),
            grade,
            metrics,
            assessment: qualityScore >= 80 ? 'Premium Quality' : qualityScore >= 60 ? 'Standard Quality' : 'Below Standard'
        });

    } catch (error) {
        res.status(500).json({ message: 'Quality assessment failed', error: error.message });
    }
});

module.exports = router;