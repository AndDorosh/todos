import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://68e0043e93207c4b4793781f.mockapi.io/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
