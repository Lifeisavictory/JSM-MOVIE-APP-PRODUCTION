import { useState, useEffect } from 'react'
import { useDebounce } from "react-use";
import './App.css'
import './index.css'
import "tailwindcss"

import hero from './assets/hero.png';
import Search from "./assets/components/search.jsx";
import Moviecard from "./assets/components/Moviecard.jsx";
import {updateSearchCount, getTrendingMovies} from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function App() {

    const [searchTerm, setSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsloading] = useState(false);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState();
    const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
    const [trendingMovies, setTrendingMovies] = useState([]);

    // Debounce the search to prevent unnecessary API calls
    useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm] );


    const fetchMovies = async (query = '') => {
        setIsloading(true);
        setError(null);

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&sort_by=popularity.desc`
                :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);
            if (!response.ok) {
                throw new Error("Failed to fetch movies");
            }
            const data = await response.json();
            if (data.Response === "False") {
                setError(data.Error || "Error fetching movies. Please try again later.");
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);
            // update search count in Appwrite.js
            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
            setTotalResults(data.total_results);
            console.log(data);
        } catch (error) {
            setError("Error fetching movies. Please try again later.");
            console.error("Error fetching movies:", error);
        } finally {
            setIsloading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error("Error fetching trending movies:", error);
        }
    }

    useEffect( () => {
        fetchMovies (debounceSearchTerm);
    }, [debounceSearchTerm]);

    useEffect(() => {
        console.log("Updated totalResults:", {totalResults} )
    }, [totalResults]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);


    return (
        <main>
            {/* Horní bar se jménem a odkazy na GitHub a LinkedIn */}
            <div className="top-bar bg-gray-900 text-white px-6 py-4">
                <div className="flex items-center justify-evenly">
                    <div>
                        <h3 className="text-lg">Tomáš Salamánek - junior programátor</h3>
                        <p className="text-sm text-white-400">ukázka použití API z www.themoviedb.org</p>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://www.github.com/lifeisavictory" target="_blank" rel="noopener noreferrer">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/733/733553.png"
                                alt="GitHub"
                                className="w-6 h-6 opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </a>
                        <a href="https://www.linkedin.com/in/salamanek" target="_blank" rel="noopener noreferrer">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                                alt="LinkedIn"
                                className="w-6 h-6 hover:opacity-100 transition-opacity"
                            />
                        </a>
                    </div>
                </div>
            </div>

            <div className="pattern" />

            <div className="wrapper">
                <header>
                    <img src={hero} alt="Hero Banner" />
                    <h1>
                        She's<span className="text-gradient"> ready to watch</span> <br />You’re still browsing trailers
                    </h1>
                    <p className="text-white">{totalResults}  Movies For You</p>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.id}>
                                    <p>{index + 1}</p>
                                    {/*
                                    <a href={`https://www.themoviedb.org/movie/${movie.movie_id}`} target="_blank" rel="noopener noreferrer"></a>
                                    */}
                                        <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2>All Movies</h2>
                    <ul>
                        {movieList.map((movie) => (
                            <li key={movie.id}>
                                <Moviecard movie={movie} />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>


        </main>
    )



}


export default App