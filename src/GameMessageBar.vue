<template>
    <div>{{ message }}</div>
</template>


<script>
export default {
    props: {
        humanTurn: Boolean,
        gameOver: Boolean,
        humanWin: Boolean,
    },
    computed: {
        message: function() {
            if (this.gameOver) {
                if (this.humanWin == null)
                    return "It's a draw!"
                else {
                    if (this.humanWin)
                        return "You win!"
                    else
                        return "You lose!"
                }
            }
            else {
                if (this.humanTurn)
                    return "Your turn."
                else
                    return "Please wait..."
            }
        },
    },
}
</script>
