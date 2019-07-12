<template>
    <circle
        :r="pieceRadius"
        :class="player"
        :cx="x"
        :cy="y"
        />
</template>


<script>
import gameGraphicsMixin from './gameGraphicsMixin.js'

export default {
    mixins: [ gameGraphicsMixin ],
    props: { 
        isHuman: Boolean,
        x: Number,
        y: Number,
    },
    computed: {
        player: function() {
            return this.isHuman ? "human" : "computer"
        },
    },
}
</script>


<style scoped>
.human {
    fill: #ffd500;
}

.computer {
    fill: #e63c1a;
}
</style>
