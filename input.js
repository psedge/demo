
function playNote(freq, bpm) {
    let osc = audioContext.createOscillator();
    osc.connect( audioContext.destination );
    osc.frequency.value = freq;
    osc.start( audioContext.currentTime );
    osc.stop( audioContext.currentTime + 1/bpm );
}