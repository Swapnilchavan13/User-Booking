import React, { useState, useEffect } from 'react';
import '../Styles/home.css';
import { Booking } from './Booking';

export const Home = () => {
    const [movieData, setMovieData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [movie, setMovie] = useState([]);
    // const [user, setUser] = useState(null);
    const [add, setAdd] = useState('');
  
    useEffect(() => {
      navigator.geolocation.getCurrentPosition(pos=>{
        const {latitude, longitude} = pos.coords;
        // console.log(latitude,longitude)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
     fetch(url).then(res=>res.json()).then(data => setAdd(data.address))
    })
    }, []);

    // console.log(add)
  
    const user = { "_id":"6536348f41c8d04b61343522","location":"Mumbai","loginid":"user1","name":"Cinemass Cinema","password":"1234","rows":[{"option":"A","seats":6,"_id":"6536348f41c8d04b61343523"},{"option":"B","seats":7,"_id":"6536348f41c8d04b61343524"},{"option":"C","seats":8,"_id":"6536348f41c8d04b61343525"}],"__v":0}
    
    useEffect(() => {
        // Fetch data from your API endpoint
        fetch('http://62.72.59.146:3005/moviedata')
            .then((response) => response.json())
            .then((data) => {
                setMovie(data);
            })
            .catch((error) => {
                console.error('Error fetching movie data:', error);
            });
    }, [])

    useEffect(() => {
        // Fetch data from your API endpoint
        fetch('http://62.72.59.146:3005/theatredata')
            .then((response) => response.json())
            .then((data) => {
                // setUser(data[1]);
            })
            .catch((error) => {
                console.error('Error fetching movie data:', error);
            });
    }, [])
    

    useEffect(() => {
        // Fetch data from your API endpoint
        fetch('http://62.72.59.146:3005/allocatedata')
            .then((response) => response.json())
            .then((data) => {
                // Filter the data based on user.name
                const filteredData = data.filter((item) => item.theatreName === user.name);
                setMovieData(filteredData);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [user.name]);


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.getDate(); // Get only the day component from the date.
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedMovie(null); // Clear selected movie when a new date is selected.
        setSelectedShowtime(null); // Clear selected showtime when a new date is selected.
    };

    const handleMovieSelect = (movieName) => {
        setSelectedMovie(movieName);
        setSelectedShowtime(null); // Clear selected showtime when a new movie is selected.
    };

    const handleShowtimeSelect = (showtime) => {
        setSelectedShowtime(showtime);
    };

    // Filter out dates less than today's date
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    const dateButtons = movieData
        .filter((movie) => new Date(movie.date) >= currentDate)
        .map((movie) => {
            const dateObj = new Date(movie.date);
            const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);

            return (
                <button
                    key={movie.date}
                    onClick={() => handleDateSelect(movie.date)}
                    className={selectedDate === movie.date ? 'active' : ''}
                >
                    {`${dayOfWeek.toLocaleUpperCase()} ${formatDate(movie.date)}`}
                </button>
            );
        });

    // Create an array in the desired format
    const formattedData = user.rows.map((row) => [row.option, row.seats]);
    // To save it as a string in the format you mentioned:
    const formattedString = JSON.stringify(formattedData);
    const formatted = JSON.parse(formattedString);
    const filteredMovies = movieData.filter((movie) => movie.date === selectedDate);
    const currTime = new Date().getHours();
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = mm + '/' + dd + '/' + yyyy;

    return (
        <div className="home-container">
            <h1>Welcome, {user.name}!</h1>
            <h4>Location: {user.location}</h4>
            <h4>Cinema`s name: {user.name}</h4>
            <h4>Current City: {add.city}</h4>
            <h5>Address: {add.road}, {add.neighbourhood}, {add.amenity}, {add.postcode}</h5>
            <h3>Select a date:</h3>
            <div className="date-buttons">
                {dateButtons}
            </div>
            {selectedDate && (
                <div>
                    <h2>Movies on {formatDate(selectedDate)} in {user.name}:</h2>
                    {filteredMovies.map((movie) => (
                        <div className='mvdiv' key={movie._id}>
                            {Object.keys(movie.movieData).map((movieName) => (
                                <button
                                    key={movieName}
                                    onClick={() => handleMovieSelect(movieName)}
                                    className={selectedMovie === movieName ? 'active' : 'mvbtn'}
                                >
                                    {movieName}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {selectedMovie && (
                <div>
                    <h3>Movie: {selectedMovie}</h3>
                    <h4>Showtimes:</h4>
                    <div className="showdiv">
                        {filteredMovies
                            .find((movie) => movie.date === selectedDate)
                            .movieData[selectedMovie].map((showtime) => {
                                const isDisabled =
                                    (showtime === "9:00 AM" && selectedDate === formattedToday && 9 <= currTime) ||
                                    (showtime === "12:00 PM" && selectedDate === formattedToday && 12 <= currTime) ||
                                    (showtime === "3:00 PM" && selectedDate === formattedToday && 15 <= currTime) ||
                                    (showtime === "6:00 PM" && selectedDate === formattedToday && 18 <= currTime) ||
                                    (showtime === "9:00 PM" && selectedDate === formattedToday && 21 <= currTime);

                                if (!isDisabled && selectedShowtime === null) {
                                    // Set the first available non-disabled showtime as the default
                                    handleShowtimeSelect(showtime);
                                }

                                return (
                                    <div key={showtime}>
                                        <input
                                            type="radio"
                                            id={showtime}
                                            name="showtime"
                                            value={showtime}
                                            checked={selectedShowtime === showtime}
                                            onChange={() => handleShowtimeSelect(showtime)}
                                            disabled={isDisabled}
                                        />
                                        <label htmlFor={showtime}>{showtime}</label>
                                    </div>
                                );
                            })}
                    </div>
                    <Booking
                        selectedMovie={selectedMovie}
                        movie={movie}
                        formatted={formatted}
                        user={user}
                        showtime={selectedShowtime} // Default or selected non-disabled showtime
                        selectedDate={selectedDate}
                    />
                </div>
            )}
        </div>
    );
};