import React from "react";
import star from "../star.svg";

function Moviecard({movie: {title, vote_average, poster_path, release_date, original_language, id}}) {

    return (
        <div className="movie-card">
            {/*
                <a href={`https://www.themoviedb.org/movie/${id}`} target="_blank" rel="noopener noreferrer"> </a>
                */}
                    <img src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/src/assets/no-movie.png'} alt={title}/>
                <div className="mt-4">
                    <h3>{title}</h3>

                    <div className="content">
                        <div className="rating">
                            <img src={star} alt="Star Icon" />
                                <p> {vote_average ? vote_average.toFixed(1) : 'N/A'} </p>
                                <span>•</span>
                                <p className="lang">{original_language}</p>

                                <span>•</span>
                                <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
                        </div>
                    </div>
                </div>
       </div>
    )

}


export default Moviecard