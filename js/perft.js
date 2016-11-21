var perft_leafNodes;

function Perft(depth) { 	

	if(depth == 0) {
        perft_leafNodes++;
        return;
    }	
    
    GenerateMoves();
    
	var index;
	var move;
	
	for(index = Desk.moveListStart[Desk.ply]; index < Desk.moveListStart[Desk.ply + 1]; ++index) {
	
		move = Desk.moveList[index];	
		if(MakeMove(move) == BOOL.FALSE) {
			continue;
		}		
		Perft(depth-1);
		TakeMove();
	}
    
    return;
}

function PerftTest(depth) {    

	PrintBoard();
	console.log("Starting Test To Depth:" + depth);	
	perft_leafNodes = 0;

	var index;
	var move;
	var moveNum = 0;
	for(index = Desk.moveListStart[Desk.ply]; index < Desk.moveListStart[Desk.ply + 1]; ++index) {
	
		move = Desk.moveList[index];	
		if(MakeMove(move) == BOOL.FALSE) {
			continue;
		}	
		moveNum++;	
        var cumnodes = perft_leafNodes;
		Perft(depth-1);
		TakeMove();
		var oldnodes = perft_leafNodes - cumnodes;
        console.log("move:" + moveNum + " " + PrMove(move) + " " + oldnodes);
	}
    
	console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");      

    return;

}



















































