console.log('Lets write JS');
let currentSong = new Audio();
let song;
let currFolder;

//header
document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.right-sec').classList.toggle('open');
});


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.substring(element.href.lastIndexOf("/") + 1));
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert1" src="SVGs/music.svg" alt="">
                                    <div class="info">
                                        <div>${song.replaceAll("%20", " ")}</div>
                                        <div>Krishna</div>
                                    </div>
                                    <div class="playnow">
                                   <span>Play now </span>
                                   <img class="invert1" src="SVGs/play2.svg" alt="">
                                   </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })

    })
return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" +track)

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "SVGs/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbumbs() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    console.log(anchors);

    for (let i = 0; i < anchors.length; i++) {
        let e = anchors[i];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0];
            try {
                let res = await fetch(`/songs/${folder}/info.json`);
                let response = await res.json();
                console.log(response);

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="SVGs/play.svg" alt="">
                        </div>
                        <img class="shadow" src="/songs/${folder}/cover.jpeg" alt="">
                        <a href="">
                            <p><span>${response.title}</span></p>
                        </a>
                       <a href="#">${response.description}</a>
                       ${Array.isArray(response.artists) ? response.artists.map(artist => `<a href="${artist.url}">${artist}</a>`).join('') : ''}

                        </div>`;
                    } catch (err) {
                console.error(`Error fetching info for ${folder}:`, err);
            }
        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            
        })
    })

    // Attach click listener to each album card
Array.from(document.getElementsByClassName("card")).forEach(e => {
    const playButton = e.querySelector(".play");
    if (playButton) {
        playButton.addEventListener("click", async () => {
            const folder = e.dataset.folder;
            const songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]); // Play the first song immediately
        });
    }
});
}


async function main() {

    //Get the list of all the songs
    await getSongs("songs/SanamTeriKasam")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbumbs()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "SVGs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "SVGs/play2.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        // Update seekbar fill style
        const seekbar = document.querySelector(".seekbar");
        const percentage = (currentSong.currentTime / currentSong.duration) * 100;
        seekbar.style.background = `linear-gradient(to right, #ff4500 ${percentage}%, #ccc ${percentage}%)`;
    });

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

}

//Event listner for more
document.querySelector(".more").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
});
//close
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"
});

// Event listner for prev 
previous.addEventListener("click", () => {
    currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1])
    }
})
// Event listner for next
next.addEventListener("click", () => {
    currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1])
    }
})

//add an event to vol
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

    console.log("Setting volume to", e.target.value, "/100");
    currentSong.volume = parseInt(e.target.value) / 100
    if(currentSong.volume >0){
          document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("SVGs/mute.svg","SVGs/volume.svg") 
    }
})

//add event listner to mute the track
document.querySelector(".volume>img").addEventListener("click",e=>{

    if (e.target.src.includes("SVGs/volume.svg")){
        e.target.src = e.target.src.replace("SVGs/volume.svg" , "SVGs/mute.svg")  
        currentSong.volume= 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value =0;
    }
    else{
        e.target.src = e.target.src.replace("SVGs/mute.svg","SVGs/volume.svg") 
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value =10;
    }
})


main()

