import axios from 'axios';
export async function sqlQuery(queryStr: string) {
    return await axios.post("http://localhost:5000/api/query", { query: queryStr });
}