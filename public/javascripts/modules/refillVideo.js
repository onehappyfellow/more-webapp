function refillVideo(player){
  if (!player) return;
  const video = player.querySelector('.viewer');
  const progressBar = player.querySelector('.progress__filled');
  const start = Date.now();

  function handleProgress(){
  	const percent = this.currentTime / this.duration * 100;
  	progressBar.style.flexBasis = `${percent}%`;
    player.querySelector('.playVideo').style.display = "none";
  }
  video.addEventListener('timeupdate', handleProgress);

  function videoFinished(){
  	const html = `
      <form method="POST" action="/api/refill">
        <input name="timeElapsed" type="hidden" value="${(Date.now() - start) / 1000}" />
        <button type="submit" class="btn btn-primary max-width-200">Close</button>
      </form>`;
  	document.querySelector('.target').innerHTML = html;
  }
  video.addEventListener('ended', videoFinished);
}

export default refillVideo;
