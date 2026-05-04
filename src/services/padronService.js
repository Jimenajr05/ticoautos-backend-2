const axios = require('axios');

const PADRON_API_URL = 'http://localhost:8000';

/**
 *Consultar información de una persona en la API externa del padrón.
 * Utiliza el número de cédula para obtener el nombre completo de la persona.
 */
const getPadronDataByCedula = async (cedula) => {
    try {
        const response = await axios.get(`${PADRON_API_URL}/cedula/${cedula}`);
        return response.data;
    } catch (error) {
        console.error('Error en padronService:', error.response?.data || error.message);
        return null;
    }
};

module.exports = { getPadronDataByCedula };