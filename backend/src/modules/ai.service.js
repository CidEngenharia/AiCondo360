exports.askAI = async (req, res) => {
    const { prompt } = req.body;

    try {
        // simulação inicial
        return res.json({
            reply: "Resposta inteligente baseada em: " + prompt
        });

    } catch (err) {
        res.status(500).json({ error: "Erro na IA" });
    }
};