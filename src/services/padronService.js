const axios = require('axios');

const getPadronDataByCedula = async (cedula) => {
    const response = await axios.get(`http://localhost:8000/cedula/${cedula}`);
    return response.data;
};

module.exports = {
    getPadronDataByCedula
};