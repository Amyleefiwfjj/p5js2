let galleryBG;      // The background image of the gallery
let artworks = [];  // Array to hold artwork images

function preload() {
  // Load a background image (replace with your own path)
  galleryBG = loadImage('assets/galleryBG.png');
  
  // OPTIONAL: preload a few sample artworks
  // artworks.push(loadImage('art1.jpg'));
  // artworks.push(loadImage('art2.jpg'));
  // ...and so on
}

function setup() {
  createCanvas(800, 600);
  
  // OPTIONAL: If you want to let the user upload an image, uncomment the line below:
  createFileInput(handleFile);
  
  // OPTIONAL: If you want to capture the user's drawing from another canvas or from this canvas:
  //  you could use get() or createGraphics() and push it to artworks[] as well.
}

function draw() {
  // Draw the background gallery
  background(255);
  image(galleryBG, 0, 0, width, height);
  
  // Position each artwork in the gallery
  // For simplicity, let’s place them side by side along a “wall.”
  let xOffset = 100;   // start x-position for first image
  let yOffset = 150;   // y-position of the “wall” or the line where paintings hang
  let spacing = 220;   // horizontal spacing between images

  for (let i = 0; i < artworks.length; i++) {
    let art = artworks[i];
    
    // Decide on a consistent “frame” size for each piece
    // e.g., 200 wide x 150 tall (adjust as needed)
    let frameWidth = 200;
    let frameHeight = 150;
    
    // Draw a “frame” (optional)
    stroke(80, 42, 20); // a brownish color for a frame
    strokeWeight(4);
    fill(255, 230, 200); // a light color inside the frame
    rect(xOffset + i * spacing, yOffset, frameWidth, frameHeight);
    
    // Draw the artwork inside the frame
    image(art, xOffset + i * spacing, yOffset, frameWidth, frameHeight);
  }
}

// This function is triggered if you use createFileInput(handleFile)
function handleFile(file) {
  // If it's an image file, load it as a p5.Image
  if (file.type === 'image') {
    let newArtwork = loadImage(file.data, () => {
      // Once loaded, push it into the artworks array
      artworks.push(newArtwork);
    });
  } else {
    // Not an image file
    console.log('Not an image file!');
  }
}
