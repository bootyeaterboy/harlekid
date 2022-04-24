import Header from './components/header';
import Player from './components/player';
import {initializeThreeJsObjects} from './canvas/initializer';
import {lifecycle} from './canvas/lifecycle';
import Footer from './components/footer';
import Universe from './canvas/universe';
import ripple from './effects/ripple';
import '/css/styles.scss';
import '/css/stats.scss';

const [camera, canvas, antialiasingComposer, controls, fxaaPass, renderer, scene, stats] = initializeThreeJsObjects();
const universe = new Universe(scene, camera, controls);
const header = new Header();
const footer = new Footer();
const player = new Player();
const portalOpeners = [header.logo, footer.musicButton];

addOpenPortalEventListeners();
updateFxaaPass();
animate();

function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    universe.animate();
    controls.update();
    if (window.innerHeight > 1000) {
        renderer.render(scene, camera);
    } else {
        antialiasingComposer.render();
    }
    stats.end();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    antialiasingComposer.setSize(window.innerWidth, window.innerHeight);
    updateFxaaPass();
    document.body.style.height = `${window.innerHeight}px`;
    controls.handleResize();
    header.handleResize();
});

canvas.addEventListener('pointerdown', onMouseDown);
canvas.addEventListener('pointerup', onMouseUp);
player.closeButton.addEventListener('click', onClose);

document.getElementById('stats-button').addEventListener('click', () => {
    document.getElementById('stats-container').classList.toggle('hidden');
});

function addOpenPortalEventListeners() {
    portalOpeners.forEach(element => element.addEventListener('click', onOpen));
}

function removeOpenPortalEventListeners() {
    portalOpeners.forEach(element => element.removeEventListener('click', onOpen));
}

function onMouseDown(event) {
    universe.onMouseDown(event);
}

function onMouseUp(event) {
    const faceIndex = universe.onMouseUp(event);
    if (universe.cube.lifecycleStage !== lifecycle.present ||
        faceIndex === undefined) {
        return;
    }
    player.selectSong(faceIndex);
}

function onOpen(event) {
    removeOpenPortalEventListeners();
    universe.showPortal(() => {
        header.logo.addEventListener('click', onClose);
        player.show();
    });
    header.moveUp();
    footer.hide();
    ripple(event);
}

function onClose(event) {
    header.logo.removeEventListener('click', onClose);
    player.hide();
    player.pause();
    universe.hidePortal(() => {
        header.moveDown(() => addOpenPortalEventListeners());
        footer.show();
    });
    ripple(event);
}

function updateFxaaPass() {
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
}
