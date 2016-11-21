
function PIECEINDEX(pce, pceNum) {
	return (pce * 10 + pceNum);
}

var Desk = {};

Desk.pieces = new Array(BOARD_NUMBER);
Desk.side = COLOURS.WHITE;
Desk.fiftyMove = 0;
Desk.historyPly = 0;
Desk.history = [];
Desk.ply = 0;
Desk.enPas = 0;
Desk.castlePerm = 0;
Desk.material = new Array(2); // WHITE,BLACK material of pieces
Desk.pceNum = new Array(13); // indexed by Pce
Desk.pList = new Array(14 * 10);
Desk.posKey = 0;
Desk.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
Desk.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
Desk.moveListStart = new Array(MAXDEPTH);
Desk.PvTable = [];
Desk.PvArray = new Array(MAXDEPTH);
Desk.searchHistory = new Array( 14 * BOARD_NUMBER);
Desk.searchKillers = new Array(3 * MAXDEPTH);
Desk.player = -1;


function CheckBoard() {   
 
	var t_pceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var t_material = [ 0, 0];
	var sq64, t_piece, t_pce_num, sq120, colour, pcount;
	
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		for(t_pce_num = 0; t_pce_num < Desk.pceNum[t_piece]; ++t_pce_num) {
			sq120 = Desk.pList[PIECEINDEX(t_piece,t_pce_num)];
			if(Desk.pieces[sq120] != t_piece) {
				console.log('Error Pce Lists');
				return BOOL.FALSE;
			}
		}	
	}
	
	for(sq64 = 0; sq64 < 64; ++sq64) {
		sq120 = SQ120(sq64);
		t_piece = Desk.pieces[sq120];
		t_pceNum[t_piece]++;
		t_material[PieceCol[t_piece]] += PieceVal[t_piece];
	}
	
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		if(t_pceNum[t_piece] != Desk.pceNum[t_piece]) {
				console.log('Error t_pceNum');
				return BOOL.FALSE;
			}	
	}
	
	if(t_material[COLOURS.WHITE] != Desk.material[COLOURS.WHITE] ||
			 t_material[COLOURS.BLACK] != Desk.material[COLOURS.BLACK]) {
				console.log('Error t_material');
				return BOOL.FALSE;
	}	
	
	if(Desk.side!=COLOURS.WHITE && Desk.side!=COLOURS.BLACK) {
				console.log('Error Desk.side');
				return BOOL.FALSE;
	}
	
	if(GeneratePosKey()!=Desk.posKey) {
				console.log('Error Desk.posKey');
				return BOOL.FALSE;
	}	
	return BOOL.TRUE;
}

function PrintBoard() {
	
	var sq,file,rank,piece;

	console.log("\nGame Board:\n");
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =(RankChar[rank] + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = Desk.pieces[sq];
			line += (" " + PceChar[piece] + " ");
		}
		console.log(line);
	}
	
	console.log("");
	var line = "   ";
	for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + FileChar[file] + ' ');	
	}
	
	console.log(line);
	console.log("side:" + SideChar[Desk.side] );
	console.log("enPas:" + Desk.enPas);
	line = "";	
	
	if(Desk.castlePerm & CASTLEBIT.WKCA) line += 'K';
	if(Desk.castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if(Desk.castlePerm & CASTLEBIT.BKCA) line += 'k';
	if(Desk.castlePerm & CASTLEBIT.BQCA) line += 'q';
	console.log("castle:" + line);
	console.log("key:" + Desk.posKey.toString(16));
	// console.log("player: " + Desk.player);
}

function GeneratePosKey() {

	var sq = 0;
	var finalKey = 0;
	var piece = PIECES.EMPTY;

	for(sq = 0; sq < BOARD_NUMBER; ++sq) {
		piece = Desk.pieces[sq];
		if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {			
			finalKey ^= PieceKeys[(piece * 120) + sq];
		}		
	}

	if(Desk.side == COLOURS.WHITE) {
		finalKey ^= SideKey;
	}
	
	if(Desk.enPas != SQUARES.NO_SQ) {		
		finalKey ^= PieceKeys[Desk.enPas];
	}
	
	finalKey ^= CastleKeys[Desk.castlePerm];
	
	return finalKey;

}

function PrintPieceLists() {

	var piece, pceNum;
	
	for(piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
		for(pceNum = 0; pceNum < Desk.pceNum[piece]; ++pceNum) {
			console.log('Piece ' + PceChar[piece] + ' on ' + PrSq( Desk.pList[PIECEINDEX(piece,pceNum)] ));
		}
	}

}

function UpdateListsMaterial() {	
	
	var piece,sq,index,colour;
	
	for(index = 0; index < 14 * 120; ++index) {
		Desk.pList[index] = PIECES.EMPTY;
	}
	
	for(index = 0; index < 2; ++index) {		
		Desk.material[index] = 0;		
	}	
	
	for(index = 0; index < 13; ++index) {
		Desk.pceNum[index] = 0;
	}
	
	for(index = 0; index < 64; ++index) {
		sq = SQ120(index);
		piece = Desk.pieces[sq];
		if(piece != PIECES.EMPTY) {
			
			colour = PieceCol[piece];		
			
			Desk.material[colour] += PieceVal[piece];
			
			Desk.pList[PIECEINDEX(piece,Desk.pceNum[piece])] = sq;
			Desk.pceNum[piece]++;			
		}
	}
	
}

function ResetBoard() {
	
	var index = 0;
	
	for(index = 0; index < BOARD_NUMBER; ++index) {
		Desk.pieces[index] = SQUARES.OFFBOARD;
	}
	
	for(index = 0; index < 64; ++index) {
		Desk.pieces[SQ120(index)] = PIECES.EMPTY;
	}
	
	Desk.side = COLOURS.BOTH;
	Desk.enPas = SQUARES.NO_SQ;
	Desk.fiftyMove = 0;	
	Desk.ply = 0;
	Desk.historyPly = 0;	
	Desk.castlePerm = 0;	
	Desk.posKey = 0;
	Desk.moveListStart[Desk.ply] = 0;
	
}

//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

function ParseFen(fen) {

	ResetBoard();
	
	var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;  
	var sq120 = 0;
	var fenCnt = 0; // fen[fenCnt]
	
	while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
	    count = 1;
		switch (fen[fenCnt]) {
			case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;
            
            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;  
            default:
                console.log("FEN error");
                return;

		}
		
		for (i = 0; i < count; i++) {	
			sq120 = FR2SQ(file,rank);            
            Desk.pieces[sq120] = piece;
			file++;
        }
		fenCnt++;
	} // while loop end
	
	//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
	Desk.side = (fen[fenCnt] == 'w') ? COLOURS.WHITE : COLOURS.BLACK;
	fenCnt += 2;
	
	for (i = 0; i < 4; i++) {
        if (fen[fenCnt] == ' ') {
            break;
        }		
		switch(fen[fenCnt]) {
			case 'K': Desk.castlePerm |= CASTLEBIT.WKCA; break;
			case 'Q': Desk.castlePerm |= CASTLEBIT.WQCA; break;
			case 'k': Desk.castlePerm |= CASTLEBIT.BKCA; break;
			case 'q': Desk.castlePerm |= CASTLEBIT.BQCA; break;
			default:	     break;
        }
		fenCnt++;
	}
	fenCnt++;	
	
	if (fen[fenCnt] != '-') {        
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();	
		console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);	
		Desk.enPas = FR2SQ(file,rank);		
    }
	
	Desk.posKey = GeneratePosKey();	
	UpdateListsMaterial();
}

function PrintSqAttacked() {
	
	var sq,file,rank,piece;

	console.log("\nAttacked:\n");
	
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =((rank+1) + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			if(SqAttacked(sq, Desk.side^1) == BOOL.TRUE) piece = "X";
			else piece = "-";
			line += (" " + piece + " ");
		}
		console.log(line);
	}
	
	console.log("");
	
}

function SqAttacked(sq, side) {
	var pce;
	var t_sq;
	var index;
	
	if(side == COLOURS.WHITE) {
		if(Desk.pieces[sq - 11] == PIECES.wP || Desk.pieces[sq - 9] == PIECES.wP) {
			return BOOL.TRUE;
		}
	} else {
		if(Desk.pieces[sq + 11] == PIECES.bP || Desk.pieces[sq + 9] == PIECES.bP) {
			return BOOL.TRUE;
		}	
	}
	
	for(index = 0; index < 8; index++) {
		pce = Desk.pieces[sq + KnDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKnight[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = RkDir[index];
		t_sq = sq + dir;
		pce = Desk.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(PieceRookQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = Desk.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = BiDir[index];
		t_sq = sq + dir;
		pce = Desk.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(PieceBishopQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = Desk.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 8; index++) {
		pce = Desk.pieces[sq + KiDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKing[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	return BOOL.FALSE;
	

}





































































