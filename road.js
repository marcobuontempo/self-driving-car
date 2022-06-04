class Road {
    constructor(x, width, laneCount=3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = this.x - this.width/2;
        this.right = this.x + this.width/2;

        const infinity = 100000000;
        this.top = -infinity;
        this.bottom = infinity;

        const topLeft = {x:this.left, y:this.top};
        const topRight = {x:this.right, y:this.top};
        const bottomLeft = {x:this.left, y:this.bottom};
        const bottomRight = {x:this.right, y:this.bottom};
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ]
    }

    getLaneCenter(laneIndex) {
        const laneWidth = this.width/this.laneCount;
        return this.left + laneWidth/2 + Math.min(this.laneCount-1,laneIndex)*laneWidth;
    }

    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        for(let i=1; i<this.laneCount; i++) {
            // to get x-coordinate of each lane
            const x = lerp(
                this.left,
                this.right,
                i/this.laneCount
            );

            // to draw each middle lane
            ctx.setLineDash([20,20]); // set dashes for middle lanes NOT WORKING IN CHROME(?)
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        // to draw outer lanes
        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.strokeStyle = "yellow"
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        })
    }
}