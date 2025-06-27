//Capturar todos os erros em um único local, formatar a 
//resposta de forma consistente e evitar a repetição de 
// código try-catch em cada controlador.


// Middleware para lidar com rotas não encontradas (404 Not Found)
const notFound = (req, res, next) => {
    const error = new Error(`Não Encontrado - ${req.originalUrl}`);
    res.status(404);
    next(error); // Passa o erro para o próximo middleware
};

// Middleware para lidar com erros gerais (incluindo os que passamos com next(error))
const errorHandler = (err, req, res, next) => {
    // Se o status da resposta já foi definido para 200, mude para 500 (Erro Interno do Servidor)
    // Isso acontece se um erro ocorreu após o envio de cabeçalhos 200 OK
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message,
        // Em ambiente de desenvolvimento, inclua a stack trace para depuração
        // Em produção, evite enviar a stack trace por segurança
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };