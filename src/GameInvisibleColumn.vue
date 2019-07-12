<template>
    <rect
        :x="boardPadding + col*(2*pieceRadius + pieceGap)"
        :y="aboveBoard"
        :width="2*pieceRadius"
        :height="boardHeight"
        fill="none"
        pointer-events="visible"
        />
</template>


<script>
import gameGraphicsMixin from './gameGraphicsMixin.js'

export default {
    mixins: [ gameGraphicsMixin ],
    props: {
        col: Number,
    },
}
</script>
