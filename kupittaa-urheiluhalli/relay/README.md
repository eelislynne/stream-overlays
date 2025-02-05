### Point overlay (`./points`)

Add `index.html` as a browser input in the streaming software. The overlay will query the Tilastopaja API endpoint every 10 seconds and update the scores.  
Refreshing the page manually is safe and will update the scores immediately, however the layout will shift during the update, so do not do this while the input is live.

### Timer overlay (`./timer`)

The timer includes a browser input and a Node.js script to be run in the background.  

**Node**: Run `npm install` and `npm run start` or `npm run dev` to launch the script. The script will listen for UDP packets on port 10124 and provide HTTP endpoints on port 3000.  
The scipt uses Regex to parse timer data out of the packets. Check `http://localhost:3000/latest-time` in the browser for latest timing results. The frontend will listen `http://localhost:3000/events` for SSE events.  
Tested on Node 18.

**index.html**: Add as a browser input to the streaming software. Connects to SSE on `http://localhost:3000/events` for event updates.  
UI will start hidden and be displayed with 200 ms fade when the timer starts. The timer will hide itself again after 5 seconds of not receiving updates.  
Hide timeout can be adjusted on line 69 `hideTimeout = setTimeout(hideTimer, 5000);`.  
Remove UI hiding by commenting out line 28 `opacity: 0;` and line 65 `timerContainer.style.opacity = "0";`.
