function GetPvLine(depth) {
	
	var move = ProbePvTable();
	var count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( MoveExists(move) == BOOL.TRUE) {
			MakeMove(move);
			Desk.PvArray[count++] = move;			
		} else {
			break;
		}		
		move = ProbePvTable();	
	}
	
	while(Desk.ply > 0) {
		TakeMove();
	}
	
	return count;
	
}

function ProbePvTable() {
	var index = Desk.posKey % PVENTRIES;
	
	if(Desk.PvTable[index].posKey == Desk.posKey) {
		return Desk.PvTable[index].move;
	}
	
	return NOMOVE;
}

function StorePvMove(move) {
	var index = Desk.posKey % PVENTRIES;
	Desk.PvTable[index].posKey = Desk.posKey;
	Desk.PvTable[index].move = move;
}