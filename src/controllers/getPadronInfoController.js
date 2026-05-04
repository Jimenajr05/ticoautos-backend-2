const { getPadronDataByCedula } = require('../services/padronService');

//Obtener la información de una persona desde el padrón utilizando su cédula

const getPadronInfo = async (req, res) => {
    const { cedula } = req.params;

    //La cédula debe tener 9 dígitos numéricos
    if (!cedula || !/^\d{9}$/.test(cedula.trim())) {
        return res.status(400).json({});
    }

    try {
        // Consulta los datos del padrón utilizando el servicio
        const padronData = await getPadronDataByCedula(cedula.trim());

        console.log('PADRON DATA:', padronData);

        // Si no se encuentra la informacion tira 404
        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(404).json({
                message: cedula
            });
        }

        // Formatea el nombre y los apellidos eliminando espacios extra
        const name = padronData.nombre?.trim() || '';
        const apellidoPaterno = padronData.apellidoPaterno?.trim() || '';
        const apellidoMaterno = padronData.apellidoMaterno?.trim() || '';

        const lastName = `${apellidoPaterno} ${apellidoMaterno}`.trim();

        // Respuesta con los datos formateados
        return res.status(200).json({
            name,
            lastName
        });

    } catch (error) {
        console.error('Error en getPadronInfoController:', error);

        return res.status(500).json({
            message: 'Error 500'
        });
    }
};

module.exports = getPadronInfo;