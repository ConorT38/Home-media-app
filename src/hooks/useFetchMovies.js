export const useFetchMovies = (searchTerm) => {
    return fetch("http://localhost:8082/api/search/" + searchTerm);

}