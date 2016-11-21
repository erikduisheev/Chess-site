var MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
var MvvLvaScores = new Array(14 * 14);

function InitMvvLva() {
	var Attacker;
	var Victim;
	
	for(Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
		for(Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
			MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - (MvvLvaValue[Attacker]/100);
		}
	}

}

function MoveExists(move) {
	
	GenerateMoves();
    
	var index;
	var moveFound = NOMOVE;
	for(index = Desk.moveListStart[Desk.ply]; index < Desk.moveListStart[Desk.ply + 1]; ++index) {
	
		moveFound = Desk.moveList[index];	
		if(MakeMove(moveFound) == BOOL.FALSE) {
			continue;
		}				
		TakeMove();
		if(move == moveFound) {
			return BOOL.TRUE;
		}
	}
	return BOOL.FALSE;
}

function MOVE(from, to, captured, promoted, flag) {
	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function AddCaptureMove(move) {
	Desk.moveList[Desk.moveListStart[Desk.ply+1]] = move;
	Desk.moveScores[Desk.moveListStart[Desk.ply+1]++] =  
		MvvLvaScores[CAPTURED(move) * 14 + Desk.pieces[FROMSQ(move)]] + 1000000;	
}

function AddQuietMove(move) {
	Desk.moveList[Desk.moveListStart[Desk.ply+1]] = move;
	Desk.moveScores[Desk.moveListStart[Desk.ply+1]] =  0;
	
	if(move == Desk.searchKillers[Desk.ply]) {
		Desk.moveScores[Desk.moveListStart[Desk.ply+1]] = 900000;
	} else if(move == Desk.searchKillers[Desk.ply + MAXDEPTH]) {
		Desk.moveScores[Desk.moveListStart[Desk.ply+1]] = 800000;
	} else {
		Desk.moveScores[Desk.moveListStart[Desk.ply+1]] = 
			Desk.searchHistory[Desk.pieces[FROMSQ(move)] * BOARD_NUMBER + TOSQ(move)];
	}
	
	Desk.moveListStart[Desk.ply+1]++
}

function AddEnPassantMove(move) {
	Desk.moveList[Desk.moveListStart[Desk.ply+1]] = move;
	Desk.moveScores[Desk.moveListStart[Desk.ply + 1]++] = 105 + 1000000;
}

function AddWhitePawnCaptureMove(from, to, cap) {
	if(RanksBrd[from]==RANKS.RANK_7) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));	
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));	
	}
}

function AddBlackPawnCaptureMove(from, to, cap) {
	if(RanksBrd[from]==RANKS.RANK_2) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));	
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));	
	}
}

function AddWhitePawnQuietMove(from, to) {
	if(RanksBrd[from]==RANKS.RANK_7) {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wQ,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wR,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wB,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wN,0));
	} else {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));	
	}
}

function AddBlackPawnQuietMove(from, to) {
	if(RanksBrd[from]==RANKS.RANK_2) {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bQ,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bR,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bB,0));
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bN,0));
	} else {
		AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));	
	}
}

function GenerateMoves() {
	Desk.moveListStart[Desk.ply+1] = Desk.moveListStart[Desk.ply];
	
	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;
	
	if(Desk.side == COLOURS.WHITE) {
		pceType = PIECES.wP;
		
		for(pceNum = 0; pceNum < Desk.pceNum[pceType]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pceType, pceNum)];			
			if(Desk.pieces[sq + 10] == PIECES.EMPTY) {
				AddWhitePawnQuietMove(sq, sq+10);
				if(RanksBrd[sq] == RANKS.RANK_2 && Desk.pieces[sq + 20] == PIECES.EMPTY) {
					AddQuietMove( MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS ));
				}
			}
			
			if(SQOFFBOARD(sq + 9) == BOOL.FALSE && PieceCol[Desk.pieces[sq+9]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, Desk.pieces[sq+9]);
			}
			
			if(SQOFFBOARD(sq + 11) == BOOL.FALSE && PieceCol[Desk.pieces[sq+11]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, Desk.pieces[sq+11]);
			}			
			
			if(Desk.enPas != SQUARES.NO_SQ) {
				if(sq + 9 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq + 11 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}			
			
		}
		
		if(Desk.castlePerm & CASTLEBIT.WKCA) {			
			if(Desk.pieces[SQUARES.F1] == PIECES.EMPTY && Desk.pieces[SQUARES.G1] == PIECES.EMPTY) {
				if(SqAttacked(SQUARES.F1, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.E1, COLOURS.BLACK) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}
		
		if(Desk.castlePerm & CASTLEBIT.WQCA) {
			if(Desk.pieces[SQUARES.D1] == PIECES.EMPTY && Desk.pieces[SQUARES.C1] == PIECES.EMPTY && Desk.pieces[SQUARES.B1] == PIECES.EMPTY) {
				if(SqAttacked(SQUARES.D1, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.E1, COLOURS.BLACK) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}		

	} else {
		pceType = PIECES.bP;
		
		for(pceNum = 0; pceNum < Desk.pceNum[pceType]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pceType, pceNum)];
			if(Desk.pieces[sq - 10] == PIECES.EMPTY) {
				AddBlackPawnQuietMove(sq, sq-10);		
				if(RanksBrd[sq] == RANKS.RANK_7 && Desk.pieces[sq - 20] == PIECES.EMPTY) {
					AddQuietMove( MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS ));
				}
			}
			
			if(SQOFFBOARD(sq - 9) == BOOL.FALSE && PieceCol[Desk.pieces[sq-9]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, Desk.pieces[sq-9]);
			}
			
			if(SQOFFBOARD(sq - 11) == BOOL.FALSE && PieceCol[Desk.pieces[sq-11]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, Desk.pieces[sq-11]);
			}			
			
			if(Desk.enPas != SQUARES.NO_SQ) {
				if(sq - 9 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq - 11 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}
		}
		if(Desk.castlePerm & CASTLEBIT.BKCA) {	
			if(Desk.pieces[SQUARES.F8] == PIECES.EMPTY && Desk.pieces[SQUARES.G8] == PIECES.EMPTY) {
				if(SqAttacked(SQUARES.F8, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.E8, COLOURS.WHITE) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}
		
		if(Desk.castlePerm & CASTLEBIT.BQCA) {
			if(Desk.pieces[SQUARES.D8] == PIECES.EMPTY && Desk.pieces[SQUARES.C8] == PIECES.EMPTY && Desk.pieces[SQUARES.B8] == PIECES.EMPTY) {
				if(SqAttacked(SQUARES.D8, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.E8, COLOURS.WHITE) == BOOL.FALSE) {
					AddQuietMove( MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
				}
			}
		}	
	}	
	
	pceIndex = LoopNonSlideIndex[Desk.side];
	pce = LoopNonSlidePce[pceIndex++];
	
	while (pce != 0) {
		for(pceNum = 0; pceNum < Desk.pceNum[pce]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pce, pceNum)];
			
			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				if(SQOFFBOARD(t_sq) == BOOL.TRUE) {
					continue;
				}
				
				if(Desk.pieces[t_sq] != PIECES.EMPTY) {
					if(PieceCol[Desk.pieces[t_sq]] != Desk.side) {
						AddCaptureMove( MOVE(sq, t_sq, Desk.pieces[t_sq], PIECES.EMPTY, 0 ));
					}
				} else {
					AddQuietMove( MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0 ));
				}
			}			
		}	
		pce = LoopNonSlidePce[pceIndex++];
	}
	
	pceIndex = LoopSlideIndex[Desk.side];
	pce = LoopSlidePce[pceIndex++];
	
	while(pce != 0) {		
		for(pceNum = 0; pceNum < Desk.pceNum[pce]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pce, pceNum)];
			
			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				while( SQOFFBOARD(t_sq) == BOOL.FALSE ) {	
				
					if(Desk.pieces[t_sq] != PIECES.EMPTY) {
						if(PieceCol[Desk.pieces[t_sq]] != Desk.side) {
							AddCaptureMove( MOVE(sq, t_sq, Desk.pieces[t_sq], PIECES.EMPTY, 0 ));
						}
						break;
					}
					AddQuietMove( MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0 ));
					t_sq += dir;
				}
			}			
		}	
		pce = LoopSlidePce[pceIndex++];
	}
}

function GenerateCaptures() {
	Desk.moveListStart[Desk.ply+1] = Desk.moveListStart[Desk.ply];
	
	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;
	
	if(Desk.side == COLOURS.WHITE) {
		pceType = PIECES.wP;
		
		for(pceNum = 0; pceNum < Desk.pceNum[pceType]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pceType, pceNum)];				
			
			if(SQOFFBOARD(sq + 9) == BOOL.FALSE && PieceCol[Desk.pieces[sq+9]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, Desk.pieces[sq+9]);
			}
			
			if(SQOFFBOARD(sq + 11) == BOOL.FALSE && PieceCol[Desk.pieces[sq+11]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, Desk.pieces[sq+11]);
			}			
			
			if(Desk.enPas != SQUARES.NO_SQ) {
				if(sq + 9 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq + 11 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}			
			
		}			

	} else {
		pceType = PIECES.bP;
		
		for(pceNum = 0; pceNum < Desk.pceNum[pceType]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pceType, pceNum)];			
			
			if(SQOFFBOARD(sq - 9) == BOOL.FALSE && PieceCol[Desk.pieces[sq-9]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, Desk.pieces[sq-9]);
			}
			
			if(SQOFFBOARD(sq - 11) == BOOL.FALSE && PieceCol[Desk.pieces[sq-11]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, Desk.pieces[sq-11]);
			}			
			
			if(Desk.enPas != SQUARES.NO_SQ) {
				if(sq - 9 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq - 11 == Desk.enPas) {
					AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}
		}			
	}	
	
	pceIndex = LoopNonSlideIndex[Desk.side];
	pce = LoopNonSlidePce[pceIndex++];
	
	while (pce != 0) {
		for(pceNum = 0; pceNum < Desk.pceNum[pce]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pce, pceNum)];
			
			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				if(SQOFFBOARD(t_sq) == BOOL.TRUE) {
					continue;
				}
				
				if(Desk.pieces[t_sq] != PIECES.EMPTY) {
					if(PieceCol[Desk.pieces[t_sq]] != Desk.side) {
						AddCaptureMove( MOVE(sq, t_sq, Desk.pieces[t_sq], PIECES.EMPTY, 0 ));
					}
				}
			}			
		}	
		pce = LoopNonSlidePce[pceIndex++];
	}
	
	pceIndex = LoopSlideIndex[Desk.side];
	pce = LoopSlidePce[pceIndex++];
	
	while(pce != 0) {		
		for(pceNum = 0; pceNum < Desk.pceNum[pce]; ++pceNum) {
			sq = Desk.pList[PIECEINDEX(pce, pceNum)];
			
			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				while( SQOFFBOARD(t_sq) == BOOL.FALSE ) {	
				
					if(Desk.pieces[t_sq] != PIECES.EMPTY) {
						if(PieceCol[Desk.pieces[t_sq]] != Desk.side) {
							AddCaptureMove( MOVE(sq, t_sq, Desk.pieces[t_sq], PIECES.EMPTY, 0 ));
						}
						break;
					}
					t_sq += dir;
				}
			}			
		}	
		pce = LoopSlidePce[pceIndex++];
	}
}



















































