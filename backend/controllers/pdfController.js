//responsável por buscar os dados do orçamento e seus itens, 
//e então usar o pdfkit para gerar o documento PDF.

const PDFDocument = require('pdfkit');
const { Budget, BudgetItem, ProductService } = require('../models');

// Helper para formatar moeda
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

// @desc    Gerar PDF de um orçamento
// @route   GET /api/budgets/:id/pdf
// @access  Private
exports.generateBudgetPdf = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Busca o orçamento com seus itens e os detalhes de ProductService associados
        const budget = await Budget.findByPk(id, {
            include: [{
                model: BudgetItem,
                as: 'budgetItems', // Usar o alias definido na associação
                include: [{
                    model: ProductService,
                    as: 'productService' // Usar o alias definido na associação
                }]
            }]
        });

        if (!budget) {
            res.status(404);
            throw new Error('Orçamento não encontrado.');
        }

        // Criar um novo documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
        });

        // Configurar cabeçalhos da resposta para download do PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="orcamento-${budget.id}.pdf"`);

        // Enviar o PDF gerado diretamente para a resposta HTTP
        doc.pipe(res);

        // --- Conteúdo do PDF ---

        // Título e Informações da Empresa (Você pode puxar isso do usuário logado ou de variáveis de ambiente)
        doc.fontSize(24).font('Helvetica-Bold').text('Orçamento de Projeto', { align: 'center' });
        doc.moveDown(1.5);

        doc.fontSize(12).font('Helvetica').text('Sua Empresa Ltda.', { align: 'right' });
        doc.text('CNPJ: XX.XXX.XXX/0001-XX', { align: 'right' });
        doc.text('Endereço: Rua da Empresa, 123 - Cidade/Estado', { align: 'right' });
        doc.text('Telefone: (XX) XXXX-XXXX', { align: 'right' });
        doc.moveDown(2);

        // Informações do Orçamento e Cliente
        doc.fontSize(14).font('Helvetica-Bold').text(`Orçamento Nº: ${budget.id}`);
        doc.fontSize(12).font('Helvetica').text(`Data: ${new Date(budget.created_at).toLocaleDateString('pt-BR')}`);
        doc.moveDown(0.5);

        doc.text(`Cliente: ${budget.client_name}`);
        doc.text(`Email: ${budget.client_email}`);
        doc.text(`Telefone: ${budget.client_phone || 'N/A'}`);
        doc.moveDown(1.5);

        doc.text(`Descrição do Projeto: ${budget.project_description}`);
        doc.moveDown(1.5);

        // Tabela de Itens do Orçamento
        doc.fontSize(14).font('Helvetica-Bold').text('Itens do Orçamento', { align: 'center' });
        doc.moveDown(0.5);

        // Cabeçalhos da Tabela
        const tableTop = doc.y;
        const itemCol = 50;
        const descCol = 150;
        const qtyCol = 350;
        const unitPriceCol = 400;
        const totalCol = 480;

        doc.font('Helvetica-Bold')
            .text('Item', itemCol, tableTop)
            .text('Descrição', descCol, tableTop)
            .text('Qtd', qtyCol, tableTop)
            .text('Unit. (R$)', unitPriceCol, tableTop)
            .text('Total (R$)', totalCol, tableTop);

        doc.lineWidth(1).moveTo(itemCol, tableTop + 20).lineTo(doc.page.width - 50, tableTop + 20).stroke();
        doc.moveDown(0.5);

        let y = doc.y;
        let subtotal = 0;

        // Linhas da Tabela
        doc.font('Helvetica');
        for (const item of budget.budgetItems) {
            const itemName = item.productService ? item.productService.name : item.name;
            const itemDesc = item.productService ? item.productService.description : item.description;

            doc.text(itemName, itemCol, y, { width: 90, align: 'left' });
            doc.text(itemDesc, descCol, y, { width: 190, align: 'left' });
            doc.text(item.quantity.toString(), qtyCol, y, { width: 40, align: 'right' });
            doc.text(formatCurrency(item.unit_price), unitPriceCol, y, { width: 70, align: 'right' });
            doc.text(formatCurrency(item.total_item_price), totalCol, y, { width: 70, align: 'right' });

            subtotal += item.total_item_price;
            y += Math.max(doc.heightOfString(itemName, { width: 90 }), doc.heightOfString(itemDesc, { width: 190 })) + 5; // Ajusta a altura da linha
            if (y > doc.page.height - 100) { // Nova página se estiver perto do fim
                doc.addPage();
                y = 50; // Reset Y para nova página
                doc.font('Helvetica-Bold') // Recria cabeçalhos na nova página
                    .text('Item', itemCol, y)
                    .text('Descrição', descCol, y)
                    .text('Qtd', qtyCol, y)
                    .text('Unit. (R$)', unitPriceCol, y)
                    .text('Total (R$)', totalCol, y);
                doc.lineWidth(1).moveTo(itemCol, y + 20).lineTo(doc.page.width - 50, y + 20).stroke();
                y += 25; // Ajusta Y após cabeçalhos
                doc.font('Helvetica');
            }
        }
        doc.moveDown(1);

        // Totais
        doc.fontSize(12).font('Helvetica-Bold').text(`Subtotal: ${formatCurrency(subtotal)}`, totalCol - 100, y, { align: 'right' });
        doc.moveDown(0.5);
        doc.text(`Impostos (0%): ${formatCurrency(0)}`, totalCol - 100, doc.y, { align: 'right' }); // Exemplo de imposto
        doc.moveDown(0.5);
        doc.text(`Desconto (0%): ${formatCurrency(0)}`, totalCol - 100, doc.y, { align: 'right' }); // Exemplo de desconto
        doc.moveDown(1);
        doc.fontSize(16).font('Helvetica-Bold').text(`TOTAL GERAL: ${formatCurrency(budget.total_value)}`, totalCol - 150, doc.y, { align: 'right' });

        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica').text('Observações: O presente orçamento tem validade de 30 dias. Valores sujeitos a alteração sem aviso prévio.', { align: 'left' });

        // Finalizar o documento
        doc.end();

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};