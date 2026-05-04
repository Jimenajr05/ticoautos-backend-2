const { getPadronDataByCedula } = require('../services/padronService');

const getPadronInfo = async (req, res) => {
    const { cedula } = req.params;

    if (!cedula || !/^\d{9}$/.test(cedula.trim())) {
        return res.status(400).json({});
    }

    try {
        const padronData = await getPadronDataByCedula(cedula.trim());

        console.log('PADRON DATA:', padronData);

        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(404).json({
                message: cedula
            });
        }

        const name = padronData.nombre?.trim() || '';
        const apellidoPaterno = padronData.apellidoPaterno?.trim() || '';
        const apellidoMaterno = padronData.apellidoMaterno?.trim() || '';

        const lastName = `${apellidoPaterno} ${apellidoMaterno}`.trim();

        return res.status(200).json({
            name,
            lastName
        });

    } catch (error) {
        console.error('Error en getPadronInfoController:', error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

module.exports = getPadronInfo;