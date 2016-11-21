function ClearPiece(sq) {

	var pce = Desk.pieces[sq];
	var col = PieceCol[pce];
	var index;
	var t_pceNum = -1;
	
	HASH_PCE(pce, sq);
	
	Desk.pieces[sq] = PIECES.EMPTY;
	Desk.material[col] -= PieceVal[pce];
	
	for(index = 0; index < Desk.pceNum[pce]; ++index) {
		if(Desk.pList[PIECEINDEX(pce,index)] == sq) {
			t_pceNum = index;
			break;
		}
	}
	
	Desk.pceNum[pce]--;
	Desk.pList[PIECEINDEX(pce, t_pceNum)] = Desk.pList[PIECEINDEX(pce, Desk.pceNum[pce])];	

}

function AddPiece(sq, pce) {

	var col = PieceCol[pce];
	
	HASH_PCE(pce, sq);
	
	Desk.pieces[sq] = pce;
	Desk.material[col] += PieceVal[pce];
	Desk.pList[PIECEINDEX(pce, Desk.pceNum[pce])] = sq;
	Desk.pceNum[pce]++;

}

function MovePiece(from, to) {
	
	var index = 0;
	var pce = Desk.pieces[from];
	
	HASH_PCE(pce, from);
	Desk.pieces[from] = PIECES.EMPTY;
	
	HASH_PCE(pce,to);
	Desk.pieces[to] = pce;
	
	for(index = 0; index < Desk.pceNum[pce]; ++index) {
		if(Desk.pList[PIECEINDEX(pce,index)] == from) {
			Desk.pList[PIECEINDEX(pce,index)] = to;
			break;
		}
	}
	
}

function MakeMove(move) {
	
	var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = Desk.side;	

	Desk.history[Desk.historyPly].posKey = Desk.posKey;

	if( (move & MFLAGEP) != 0) {
		if(side == COLOURS.WHITE) {
			ClearPiece(to-10);
		} else {
			ClearPiece(to+10);
		}
	} else if( (move & MFLAGCA) != 0) {
		switch(to) {
			case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
			break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
			break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
			break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
			break;
            default: break;
		}
	}
	
	if(Desk.enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();
	
	Desk.history[Desk.historyPly].move = move;
    Desk.history[Desk.historyPly].fiftyMove = Desk.fiftyMove;
    Desk.history[Desk.historyPly].enPas = Desk.enPas;
    Desk.history[Desk.historyPly].castlePerm = Desk.castlePerm;
    
    Desk.castlePerm &= CastlePerm[from];
    Desk.castlePerm &= CastlePerm[to];
    Desk.enPas = SQUARES.NO_SQ;
    
    HASH_CA();
    
    var captured = CAPTURED(move);
    Desk.fiftyMove++;
    
    if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        Desk.fiftyMove = 0;
    }
    
    Desk.historyPly++;
	Desk.ply++;
	
	if(PiecePawn[Desk.pieces[from]] == BOOL.TRUE) {
        Desk.fiftyMove = 0;
        if( (move & MFLAGPS) != 0) {
            if(side==COLOURS.WHITE) {
                Desk.enPas=from+10;
            } else {
                Desk.enPas=from-10;
            }
            HASH_EP();
        }
    }
    
    MovePiece(from, to);
    
    var prPce = PROMOTED(move);
    if(prPce != PIECES.EMPTY)   {       
        ClearPiece(to);
        AddPiece(to, prPce);
    }
    
    Desk.side ^= 1;
    HASH_SIDE();
    
    if(SqAttacked(Desk.pList[PIECEINDEX(Kings[side],0)], Desk.side))  {
         TakeMove();
    	return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
}

function TakeMove() {
	
	Desk.historyPly--;
    Desk.ply--;
    
    var move = Desk.history[Desk.historyPly].move;
	var from = FROMSQ(move);
    var to = TOSQ(move);
    
    if(Desk.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    Desk.castlePerm = Desk.history[Desk.historyPly].castlePerm;
    Desk.fiftyMove = Desk.history[Desk.historyPly].fiftyMove;
    Desk.enPas = Desk.history[Desk.historyPly].enPas;
    
    if(Desk.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    Desk.side ^= 1;
    HASH_SIDE();
    
    if( (MFLAGEP & move) != 0) {
        if(Desk.side == COLOURS.WHITE) {
            AddPiece(to-10, PIECES.bP);
        } else {
            AddPiece(to+10, PIECES.wP);
        }
    } else if( (MFLAGCA & move) != 0) {
        switch(to) {
        	case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }
    
    MovePiece(to, from);
    
    var captured = CAPTURED(move);
    if(captured != PIECES.EMPTY) {      
        AddPiece(to, captured);
    }
    
    if(PROMOTED(move) != PIECES.EMPTY)   {        
        ClearPiece(from);
        AddPiece(from, (PieceCol[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
    
}























































































