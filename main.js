
async function getsongs() {


    let a = await fetch("http://127.0.0.1:3000/songs/")
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1])
        }
    }

    return songs
}

const playMusic = (track) => {
    // Encode the track name to handle spaces and special characters
    let audio = new Audio(`http://127.0.0.1:3000/songs/${encodeURIComponent(track)}`);
    audio.play();
};


async function main() {

    let currentSong;



    //get the list of all the song
    let songs = await getsongs()
    console.log(songs)


    //show all the playlist in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]

    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
                            <img src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ").replaceAll(" 320 Kbps", "")} </div> 
                                <div>Arjit Aingh</div> 
                            </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="plays.svg" alt="">
                            </div>
    </li>`;
    }

    //attach an eventlistener to each songs

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{

        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })

    

}

main()