const { getPadronDataByCedula } = require('../services/padronService');

const getPadronInfo = async (req, res) => {
    const { cedula } = req.params;

    if (!/^\d{9}$/.test(cedula.trim())) {
        return res.status(400).json({
            message: 'La cédula debe tener exactamente 9 dígitos'
        });
    }

    try {
        const padronData = await getPadronDataByCedula(cedula.trim());

        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(404).json({
                message: 'La cédula no existe en el padrón'
            });
        }

        const fullLastName = `${padronData.apellidoPaterno} ${padronData.apellidoMaterno}`.trim();

        return res.status(200).json({
            cedula: padronData.cedula,
            name: padronData.nombre,
            lastName: fullLastName
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al consultar el padrón'
        });
    }
};

module.exports = getPadronInfo;