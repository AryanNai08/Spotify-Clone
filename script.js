(async function () {
    // Fetch the list of songs from the server

    let currentsong = new Audio();
    let songs;
    let currfolder;

    function convertSecondsToMinutes(seconds) {
        // Ensure seconds is rounded down to the nearest integer
        seconds = Math.floor(seconds);

        let minutes = Math.floor(seconds / 60); // Get the number of minutes
        let remainingSeconds = seconds % 60;   // Get the remaining seconds

        // Format the seconds to always have two digits
        let formattedSeconds = remainingSeconds.toString().padStart(2, "0");

        return `${minutes}:${formattedSeconds}`;
    }

    async function getsongs(folder) {
        try {
            currfolder = folder;
            let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
            let html = await response.text();

            // Parse the HTML response to extract song names
            let div = document.createElement("div");
            div.innerHTML = html;
            let links = div.getElementsByTagName("a");

            songs = [];
            for (let link of links) {
                if (link.href.endsWith(".mp3")) {
                    songs.push(decodeURIComponent(link.href.split(`${folder}/`)[1])); // Decode song names
                }
            }
            return songs;
        } catch (error) {
            console.error("Failed to fetch songs:", error);
            return [];
        }
    }

    // Play the selected song
    const playMusic = (track,pause=false) => {
        // let audio = new Audio(`http://127.0.0.1:3000/songs/${encodeURIComponent(track)}`); 
        currentsong.src = (`http://127.0.0.1:3000/${currfolder}/${encodeURIComponent(track)}`)
        currentsong.play();
        if (!pause) {
            currentsong.play()
            play.src = "pause.svg"
        }

        document.querySelector(".songinfo").innerHTML = track
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
    };


    async function displayAlbums(params) {
        let response = await fetch(`http://127.0.0.1:3000/songs/`);
        let html = await response.text();

        // Parse the HTML response to extract song names
        let div = document.createElement("div");
        div.innerHTML = html;
        let anchors = div.getElementsByTagName("a")



        let cardContainer = document.querySelector(".cardContainer")

        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/songs")) {
                let folder = e.href.split("/").slice(-2)[0]

                //get metadata of this folder
                let response = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let html = await response.json();
                console.log(html)
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                color="#000000" fill="black">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h3>${html.title}</h3>
                        <p>${html.description}</p>
                    </div>`

            }
        }


        //load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folder = `songs/${item.currentTarget.dataset.folder}`;
                songs = await getsongs(folder); // Fetch songs for the selected folder
                playMusic(songs[0])

                // Clear the current song list
                let songList = document.querySelector(".songlist ul");
                songList.innerHTML = "";

                // Update the playlist with the new songs
                songs.forEach((song) => {
                    let li = document.createElement("li");
                    li.innerHTML = `
                        <img src="music.svg" alt="Music Icon">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ").replaceAll(" 320 Kbps", "")}</div>
                            <div>Aryan</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img src="plays.svg" alt="Play Icon">
                        </div>
                    `;
                    songList.appendChild(li);

                    // Add click event listener to play the song
                    li.addEventListener("click", () => {
                        playMusic(song);
                    });
                });
            });
        });
    }





    // Main function to load and render the playlist
    async function main() {


        await getsongs("songs/Pritam"); // Get songs list
        console.log("Fetched Songs:", songs);
        // playMusic(songs[0], true)

        let songList = document.querySelector(".songlist ul");
        songList.innerHTML = ""; // Clears the playlist before adding new songs



        //display all the album on the page
        displayAlbums()

        // Populate the playlist with songs
        songs.forEach((song) => {
            let li = document.createElement("li");
            li.innerHTML = `
                <img src="music.svg" alt="Music Icon">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").replaceAll(" 320 Kbps", "")}</div>
                    <div>Aryan</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="plays.svg" alt="Play Icon">
                </div>
            `;
            songList.appendChild(li);

            // Add click event listener to play the song
            li.addEventListener("click", () => {
                playMusic(song);
            });
        });

        //attach an evenetlistener to play next and previous
        play.addEventListener("click", () => {
            if (currentsong.paused) {
                currentsong.play()
                play.src = "pause.svg"
            }
            else {
                currentsong.pause()
                play.src = "play.svg"
            }
        })


        //listen for time update event

        currentsong.addEventListener("timeupdate", () => {
            // console.log(currentsong.currentTime, currentsong.duration)
            document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`
            document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
        })

        //add an event listner to seekbar 
        document.querySelector(".seekbar").addEventListener("click", e => {

            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100

            document.querySelector(".circle").style.left = percent + "%"

            currentsong.currentTime = (currentsong.duration) * percent / 100
        })



        //add event listener forhamburger

        document.querySelector(".hamburgercontainer").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0"
        })


        //add eventlistener for close
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%"
        })


        //add eventlistener to previous button

        previous.addEventListener("click", () => {
            console.log("Previous click");
          

            let index = songs.indexOf(currentsong.src.split("/").pop()); // Get the song index

            if (index > 0) {
                playMusic(songs[index - 1]); // Play the previous song if not the first song
            } else {
                playMusic(songs[songs.length - 1]); // If at the first song, play the last song (loop)
            }
        });

        // Add event listener to the next button
        next.addEventListener("click", () => {
            console.log("Next click");


            let index = songs.indexOf(currentsong.src.split("/").pop()); // Get the song index

            if (index < songs.length - 1) {
                playMusic(songs[index + 1]); // Play the next song if not the last song
            } else {
                playMusic(songs[0]); // If at the last song, play the first song (loop)
            }


        });


        //addd event to volume
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            console.log("setting volume to", e.target.value), "/ 100"
            currentsong.volume = parseInt(e.target.value) / 100
        })



        // Add event listener to mute the track
        document.querySelector(".volume>img").addEventListener("click", e => {
            if (e.target.src.includes("volume.svg")) {
                e.target.src = e.target.src.replace("volume.svg", "mute.svg")
                currentsong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            }
            else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg")
                currentsong.volume = .10;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            }

        })






    }

    // Start the application
    main();
})();
