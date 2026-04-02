const { getPadronDataByCedula } = require('../services/padronService');

const getPadronInfo = async (req, res) => {
    const { cedula } = req.params;

    if (!/^\d{9}$/.test(cedula.trim())) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    try {
        const padronData = await getPadronDataByCedula(cedula.trim());

        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(404).json({
                message: 'Error 404'
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
            message: 'Error 500'
        });
    }
};

module.exports = getPadronInfo;