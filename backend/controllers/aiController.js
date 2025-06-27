// backend/controllers/aiController.js

const { GoogleGenerativeAI } = require('@google/generative-ai'); // Exemplo para Google Gemini
// const OpenAI = require('openai'); // Exemplo para OpenAI

const { ProductService } = require('../models'); // Para talvez validar ou buscar dados
const { Input } = require('../models'); // Para talvez buscar dados

// Inicializa a API de IA com sua chave
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Para Gemini
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Escolha o modelo

/*
// Exemplo de inicialização para OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
*/

// @desc    Gerar sugestões de itens de orçamento com IA
// @route   POST /api/ai/generate-budget-items
// @access  Private
exports.generateBudgetItems = async (req, res, next) => {
    const {
        budget_id, // Pode ser necessário para associar, mas a IA gera, não associa diretamente aqui
        project_description,
        service_type, // Ex: "Website Development", "Consultoria de TI", "Design Gráfico"
        estimated_total_value, // Estimativa de valor para guiar a IA
        user_id // do req.user
    } = req.body;

    if (!project_description || !service_type || !estimated_total_value || !budget_id) {
        return res.status(400).json({ message: 'Descrição do projeto, tipo de serviço, valor total estimado e ID do orçamento são obrigatórios.' });
    }

    try {
        // **Construção do Prompt para a IA**
        // Este é o coração da integração. O prompt deve ser o mais claro e descritivo possível.
        let prompt = `Você é um assistente especialista em orçamentos de projetos. Dado a seguinte descrição de um projeto e um valor total estimado, liste os principais itens de serviço e/ou produto que comporiam este orçamento.
        Para cada item, inclua:
        - nome (Nome do item de serviço/produto)
        - description (Uma breve descrição do que o item inclui)
        - quantity (A quantidade do item, ex: 1 para um site completo, 40 para horas de consultoria)
        - unit_price (O preço unitário do item)
        - estimated_time_hours (Tempo estimado em horas para o item, se aplicável, 0 se não)
        - product_service_id (Um placeholder GUID/UUID para este item, pois será criado depois)
        - total_item_price (O preço total do item = quantity * unit_price)

        O formato da saída deve ser um array de objetos JSON, sem texto adicional antes ou depois.
        O valor total dos itens gerados deve se aproximar do 'valor_total_estimado'.
        Considere que o 'user_id' é ${user_id} para contexto, mas não inclua na saída.

        Detalhes do Projeto:
        Descrição: "${project_description}"
        Tipo de Serviço: "${service_type}"
        Valor Total Estimado: ${estimated_total_value}

        Exemplo de formato esperado:
        [
            {
                "name": "Nome do Item 1",
                "description": "Descrição do Item 1",
                "quantity": 1,
                "unit_price": 1000.00,
                "estimated_time_hours": 20,
                "product_service_id": "c3d6e9f1-a1b2-c3d4-e5f6-a7b8c9d0e1f2",
                "total_item_price": 1000.00
            },
            {
                "name": "Nome do Item 2",
                "description": "Descrição do Item 2",
                "quantity": 2,
                "unit_price": 500.00,
                "estimated_time_hours": 10,
                "product_service_id": "d1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6",
                "total_item_price": 1000.00
            }
        ]
        `;

        // **Chamada à API de IA**
        // A sintaxe pode variar ligeiramente dependendo da biblioteca cliente da IA
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let aiGeneratedContent = response.text(); // O texto bruto da resposta da IA

        // Tenta parsear a resposta da IA como JSON
        let budgetItemsSuggestions;
        try {
            // A IA pode retornar o JSON dentro de blocos de código markdown (` ```json ... ``` `)
            // Precisamos extraí-lo se for o caso.
            if (aiGeneratedContent.startsWith('```json')) {
                aiGeneratedContent = aiGeneratedContent.substring(7, aiGeneratedContent.lastIndexOf('```')).trim();
            }
            budgetItemsSuggestions = JSON.parse(aiGeneratedContent);
        } catch (parseError) {
            console.error('Erro ao parsear JSON da IA:', parseError);
            console.error('Conteúdo bruto da IA:', aiGeneratedContent);
            return res.status(500).json({
                message: 'A IA gerou um formato inválido. Tente novamente ou ajuste o prompt.',
                rawAIResponse: aiGeneratedContent
            });
        }

        // Adiciona o budget_id a cada item sugerido (pois a IA não sabe este ID)
        // E gera um UUID real se product_service_id vier como placeholder ou vazio
        const finalBudgetItems = budgetItemsSuggestions.map(item => ({
            ...item,
            budget_id: budget_id,
            product_service_id: item.product_service_id || require('uuid').v4() // Gera um UUID se necessário
        }));


        // A resposta aqui são APENAS SUGESTÕES.
        // O frontend pode então usar essas sugestões para pré-popular um formulário
        // onde o usuário pode revisar, editar e realmente SALVAR os BudgetItems
        // usando a rota POST /api/budgetitems.

        res.status(200).json({
            message: 'Sugestões de itens de orçamento geradas com sucesso pela IA.',
            suggestions: finalBudgetItems,
            // Adicione aqui outros dados que o frontend possa precisar, como o budget_id original
            budget_id: budget_id
        });

    } catch (error) {
        console.error('Erro na integração com a IA:', error);
        if (error.response && error.response.status) {
            // Erro vindo da API da IA (ex: 400 Bad Request, 401 Unauthorized, 429 Too Many Requests)
            console.error(`Status da API da IA: ${error.response.status}`);
            console.error(`Detalhes do Erro da API da IA: ${JSON.stringify(error.response.data)}`);
            return next(new Error(`Erro da API de IA: ${error.response.data.error.message || error.response.status}`));
        }
        next(error); // Passa erros gerais para o middleware de erro
    }
};