<template>
    <div id="app">
        <h1>connecc4</h1>
        <Game />
    </div>
</template>


<script>
import Game from './Game.vue'

export default {
    components: {
        Game,
    },
}
</script>


<style>
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro&display=swap');

body {
    background-color: #cceeff;
    font-family: 'Source Sans Pro', sans-serif;

    /* Centre game on screen */
    display: flex;
    justify-content: center;
    align-content: center;
    height: 100vh;
}

#app {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

#app > h1 {
    color: #1a1a1a;
    font-size: 64px;
    font-weight: normal;
    margin: 0;
    text-align: center;
}
</style>
