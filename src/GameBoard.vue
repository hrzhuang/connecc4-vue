<template>
    <g>
        <defs>
            <mask id="boardMask">

                <!-- Rounded corners -->
                <rect
                    :y="aboveBoard"
                    :width="boardWidth"
                    :height="boardHeight"
                    fill="white"
                    rx="10"
                    />

                <!-- Holes -->
                <template v-for="(_, row) in rows">
                    <circle
                        v-for="(_, col) in cols"
                        :key="`${row},${col}`"
                        :cx="cx(col)"
                        :cy="cy(row)"
                        :r="holeRadius"
                        />
                </template>
            </mask>
        </defs>

        <!-- Actual board -->
        <rect
            :y="aboveBoard"
            :width="boardWidth" 
            :height="boardHeight" 
            id="board"
            mask="url(#boardMask)"
            />
    </g>
</template>


<script>
import gameGraphicsMixin from './gameGraphicsMixin.js'

export default {
    mixins: [ gameGraphicsMixin ],
}
</script>


<style scoped>
#board {
    fill: #3d6bf5;
}
</style>
