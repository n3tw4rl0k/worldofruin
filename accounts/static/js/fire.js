document.addEventListener('DOMContentLoaded', function() {
    initSparks();
    initFireEffect();
});

function initSparks() {
    const title = document.getElementById('gameTitle');
    const sparks = 20;
    for (let i = 0; i < sparks; i++) {
        let spark = document.createElement('span');
        spark.classList.add('spark');
        title.appendChild(spark);

        let animationName = `burn${Math.ceil(Math.random() * 3)}`;
        let animationDuration = `${Math.random() * 4.0 + 0.5}s`;
        let animationDelay = `-${Math.random() * 2}s`;

        spark.style.width = `${Math.random() * 5 + 2}px`;
        spark.style.height = spark.style.width;
        spark.style.left = `${50 + (Math.random() - 0.5) * 100}%`;
        spark.style.animationName = animationName;
        spark.style.animationDuration = animationDuration;
        spark.style.animationDelay = animationDelay;
    }
}

function initFireEffect() {
    const fireEffect = document.getElementById('fireEffect');
    for (let i = 0; i < 100; i++) {
        let particle = document.createElement('div');
        particle.classList.add('fire-particle');
        fireEffect.appendChild(particle);

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.animationName = 'riseFlame';
        particle.style.animationDuration = `${Math.random() * 10 + 5.5}s`;
        particle.style.animationDelay = `-${Math.random()}s`;
    }
}

