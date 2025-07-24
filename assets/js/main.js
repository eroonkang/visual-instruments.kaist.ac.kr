// Multiliungual init
$(document).ready(function(e){
  $(".ml").multilingual([
    "en", "ko"
  ]);
});

// Timestamp functionality
$(document).ready(function() {
  function updateTimestamp() {
    const now = new Date();
    // Format directly in Seoul timezone
    const kstString = now.toLocaleString('sv-SE', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(' ', ' ') + ' (KST)';
    document.getElementById('current-date').textContent = kstString;
  }
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
});

// Cell division pie chart animation
$(document).ready(function() {
  var $overlay = $('.overlay');
  var duration = 30000; // seconds per cycle
  var startTime = Date.now();
  var currentState = 1; // 1, 2, 4 for landscape; 2, 4, 8 for portrait
  var cycleStartTime = Date.now();
  
  function createSVG(index, total) {
    var centerX = 500;
    var centerY = 500;
    var radius = 499.5;
    var strokeWidth = 0.75;
    
    // Check if viewport is portrait (taller than wide)
    var isPortrait = window.innerWidth < window.innerHeight;
    
    var svgWidth, svgHeight, floatStyle;
    
    if (total === 1) {
      svgWidth = '100%';
      svgHeight = '100%';
      floatStyle = 'none';
    } else if (total === 2) {
      if (isPortrait) {
        // Stack vertically in portrait
        svgWidth = '100%';
        svgHeight = '50%';
        floatStyle = 'none';
      } else {
        // Side by side in landscape
        svgWidth = '50%';
        svgHeight = '100%';
        floatStyle = 'left';
      }
    } else if (total === 4) {
      if (isPortrait) {
        // Stack all 4 vertically in portrait
        svgWidth = '100%';
        svgHeight = '25%';
        floatStyle = 'none';
      } else {
        // All in a row in landscape
        svgWidth = '25%';
        svgHeight = '100%';
        floatStyle = 'left';
      }
    } else if (total === 8) {
      // Only in portrait mode
      svgWidth = '100%';
      svgHeight = '12.5%';
      floatStyle = 'none';
    }
    
    return `
      <svg class="cell-svg" style="width: ${svgWidth}; height: ${svgHeight}; float: ${floatStyle};" 
           viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="black" stroke-width="${strokeWidth}" fill="transparent" vector-effect="non-scaling-stroke"/>
        <path class="pie-path" d="M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY - radius} Z" 
              fill="transparent" 
              stroke="black" 
              stroke-width="${strokeWidth}" 
              vector-effect="non-scaling-stroke" />
      </svg>
    `;
  }
  
  function createPiePath(angle) {
    var centerX = 500;
    var centerY = 500;
    var radius = 499.5;
    var radians = (angle - 90) * Math.PI / 180; // -90 to start from top
    
    var endX = centerX + radius * Math.cos(radians);
    var endY = centerY + radius * Math.sin(radians);
    var largeArcFlag = angle > 180 ? 1 : 0;
    
    if (angle === 0) {
      return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY - radius} Z`;
    } else if (angle >= 360) {
      return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX - 0.01} ${centerY - radius} Z`;
    } else {
      return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    }
  }
  
  function updateSVGs(count) {
    var svgHTML = '';
    for (var i = 0; i < count; i++) {
      svgHTML += createSVG(i, count);
    }
    $overlay.html(svgHTML);
    currentState = count;
    cycleStartTime = Date.now();
  }
  
  // Handle window resize to update layout and reset to appropriate starting state
  $(window).on('resize', function() {
    var isPortrait = window.innerWidth < window.innerHeight;
    // Reset to starting state for the orientation
    if (isPortrait && currentState === 1) {
      updateSVGs(2); // Portrait starts with 2
    } else if (!isPortrait && (currentState === 8 || currentState === 2)) {
      updateSVGs(1); // Landscape starts with 1
    } else {
      updateSVGs(currentState); // Just update layout
    }
  });
  
  function animateCells() {
    var elapsed = Date.now() - cycleStartTime;
    var progress = (elapsed % duration) / duration;
    var currentAngle = progress * 360;
    var isPortrait = window.innerWidth < window.innerHeight;
    
    // Update all pie paths
    $('.pie-path').each(function() {
      var pathData = createPiePath(currentAngle);
      $(this).attr('d', pathData);
    });
    
    // Check if cycle is complete and we need to divide
    if (elapsed >= duration) {
      if (isPortrait) {
        // Portrait sequence: 2 -> 4 -> 8 -> 2
        if (currentState === 2) {
          updateSVGs(4);
        } else if (currentState === 4) {
          updateSVGs(8);
        } else if (currentState === 8) {
          updateSVGs(2); // Reset to 2
        }
      } else {
        // Landscape sequence: 1 -> 2 -> 4 -> 1
        if (currentState === 1) {
          updateSVGs(2);
        } else if (currentState === 2) {
          updateSVGs(4);
        } else if (currentState === 4) {
          updateSVGs(1); // Reset to 1
        }
      }
    }
    
    requestAnimationFrame(animateCells);
  }
  
  // Initialize with appropriate starting state based on orientation
  var isPortrait = window.innerWidth < window.innerHeight;
  updateSVGs(isPortrait ? 2 : 1);
  animateCells();
});

// Image cycling functionality
$(document).ready(function() {
  var $images = $('.tags img');
  var totalImages = $images.length;
  var visibleCount = 6;
  var currentIndex = 0;
  var interval;
  var maxIndex = totalImages - visibleCount;
  var normalInterval = 100; // Normal speed
  var slowInterval = 2000; // Slower speed for pause
  var pauseIndex = 6; // Index that shows images 5,6,7,8,9 (0-based: 4,5,6,7,8)
  
  function showImages() {
    $images.hide();
    for (var i = 0; i < visibleCount; i++) {
      var imageIndex = currentIndex + i;
      $images.eq(imageIndex).show();
    }
  }
  
  function nextSlide() {
    currentIndex++;
    
    // If we've reached the last valid position, loop back to start
    if (currentIndex > maxIndex) {
      currentIndex = 0;
    }
    
    showImages();
    
    // Clear the current interval
    clearInterval(interval);
    
    // Set different interval based on current position
    var nextInterval = (currentIndex === pauseIndex) ? slowInterval : normalInterval;
    interval = setInterval(nextSlide, nextInterval);
  }
  
  showImages();
  
  // Start with normal interval
  interval = setInterval(nextSlide, normalInterval);
});

// Adobe typekit loader
(function(d) {
  var config = {
    kitId: 'oqy0col',
    scriptTimeout: 3000,
    async: true
  },
  h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
})(document);