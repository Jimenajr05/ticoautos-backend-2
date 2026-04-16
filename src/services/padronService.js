const axios = require('axios');

const PADRON_API_URL = 'http://localhost:8000';

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