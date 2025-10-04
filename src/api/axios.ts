import axios from 'axios';

export const BASE_API = 'https://68e0043e93207c4b4793781f.mockapi.io/';

export const api = axios.create({
    baseURL: BASE_API,
    headers: {
        'Content-Type': 'application/json',
    },
});
