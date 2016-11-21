$("#SetFen").click(function () {
	var fenStr = $("#fenIn").val();	
	NewGame(fenStr);
});

$('#TakeButton').click( function () {
	if(Desk.historyPly > 0) {
		TakeMove();
		Desk.ply = 0;
		SetInitialBoardPieces();
	}
});

$('#NewGameButton').click( function () {
	NewGame(START_FEN);
});

function NewGame(fenStr) {
	ParseFen(fenStr);
	ChoosePlayer();
	PrintBoard();
	SetInitialBoardPieces();
	CheckAndSet();
}

function ChoosePlayer() {
	Desk.player = $('#ChoosePlayWith').val();
	// console.log(" changed player: " + Desk.player);
}

function ClearAllPieces() {
	$(".Piece").remove();
}

function SetInitialBoardPieces() {

	var sq;
	var sq120;
	var file,rank;
	var rankName;
	var fileName;
	var imageString;
	var pieceFileName;
	var pce;
	
	ClearAllPieces();
	
	for(sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = Desk.pieces[sq120];
		if(pce >= PIECES.wP && pce <= PIECES.bK) {
			AddGUIPiece(sq120, pce);
		}
	}
}

function DeSelectSq(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
				$(this).removeClass('SqSelected');
		}
	} );
}

function SetSqSelected(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
				$(this).addClass('SqSelected');
		}
	} );
}

function ClickedSquare(pageX, pageY) {
	console.log('ClickedSquare() at ' + pageX + ',' + pageY);
	var position = $('#Board').position();
	
	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);
	
	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);
	
	var file = Math.floor((pageX-workedX) / 60);
	var rank = 7 - Math.floor((pageY-workedY) / 60);
	
	var sq = FR2SQ(file,rank);
	
	console.log('Clicked sq:' + PrSq(sq));
	
	SetSqSelected(sq);	
	
	return sq;
}

$(document).on('click','.Piece', function (e) {
	console.log('Piece Click');
	
	if(UserMove.from == SQUARES.NO_SQ) {
		UserMove.from = ClickedSquare(e.pageX, e.pageY);
	} else {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
	}
	
	MakeUserMove();
	
});

$(document).on('click','.Square', function (e) {
	console.log('Square Click');	
	if(UserMove.from != SQUARES.NO_SQ) {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
		MakeUserMove();
	}

});

function MakeUserMove() {

	if(UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {
	
		console.log("User Move:" + PrSq(UserMove.from) + PrSq(UserMove.to));	
		
		var parsed = ParseMove(UserMove.from,UserMove.to);
		
		if(parsed != NOMOVE) {
			MakeMove(parsed);
			ChoosePlayer();
			PrintBoard();
			MoveGUIPiece(parsed);
			CheckAndSet();
			PreSearch();
		}
	
		DeSelectSq(UserMove.from);
		DeSelectSq(UserMove.to);
		
		UserMove.from = SQUARES.NO_SQ;
		UserMove.to = SQUARES.NO_SQ;
	}

}

function PieceIsOnSq(sq, top, left) {

	if( (RanksBrd[sq] == 7 - Math.round(top/60) ) && 
		FilesBrd[sq] == Math.round(left/60) ) {
		return BOOL.TRUE;
	}
		
	return BOOL.FALSE;

}

function RemoveGUIPiece(sq) {

	$('.Piece').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).remove();
		}
	} );
	
}

function AddGUIPiece(sq, pce) {

	var file = FilesBrd[sq];
	var rank = RanksBrd[sq];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	var pieceFileName = "images new 3/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".ico";
	var	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
	$("#Board").append(imageString);
}

function MoveGUIPiece(move) {
	
	var from = FROMSQ(move);
	var to = TOSQ(move);	
	
	if(move & MFLAGEP) {
		var epRemove;
		if(Desk.side == COLOURS.BLACK) {
			epRemove = to - 10;
		} else {
			epRemove = to + 10;
		}
		RemoveGUIPiece(epRemove);
	} else if(CAPTURED(move)) {
		RemoveGUIPiece(to);
	}
	
	var file = FilesBrd[to];
	var rank = RanksBrd[to];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	
	$('.Piece').each( function(index) {
		if(PieceIsOnSq(from, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).removeClass();
			$(this).addClass("Piece " + rankName + " " + fileName);
		}
	} );
	
	if(move & MFLAGCA) {
		switch(to) {
			case SQUARES.G1: RemoveGUIPiece(SQUARES.H1); AddGUIPiece(SQUARES.F1, PIECES.wR); break;
			case SQUARES.C1: RemoveGUIPiece(SQUARES.A1); AddGUIPiece(SQUARES.D1, PIECES.wR); break;
			case SQUARES.G8: RemoveGUIPiece(SQUARES.H8); AddGUIPiece(SQUARES.F8, PIECES.bR); break;
			case SQUARES.C8: RemoveGUIPiece(SQUARES.A8); AddGUIPiece(SQUARES.D8, PIECES.bR); break;
		}
	} else if (PROMOTED(move)) {
		RemoveGUIPiece(to);
		AddGUIPiece(to, PROMOTED(move));
	}
	
}

function DrawMaterial() {

	if (Desk.pceNum[PIECES.wP]!=0 || Desk.pceNum[PIECES.bP]!=0) return BOOL.FALSE;
	if (Desk.pceNum[PIECES.wQ]!=0 || Desk.pceNum[PIECES.bQ]!=0 ||
					Desk.pceNum[PIECES.wR]!=0 || Desk.pceNum[PIECES.bR]!=0) return BOOL.FALSE;
	if (Desk.pceNum[PIECES.wB] > 1 || Desk.pceNum[PIECES.bB] > 1) {return BOOL.FALSE;}
    if (Desk.pceNum[PIECES.wN] > 1 || Desk.pceNum[PIECES.bN] > 1) {return BOOL.FALSE;}
	
	if (Desk.pceNum[PIECES.wN]!=0 && Desk.pceNum[PIECES.wB]!=0) {return BOOL.FALSE;}
	if (Desk.pceNum[PIECES.bN]!=0 && Desk.pceNum[PIECES.bB]!=0) {return BOOL.FALSE;}
	 
	return BOOL.TRUE;
}

function ThreeFoldRep() {
	var i = 0, r = 0;
	
	for(i = 0; i < Desk.historyPly; ++i) {
		if (Desk.history[i].posKey == Desk.posKey) {
		    r++;
		}
	}
	return r;
}

function CheckResult() {
	if(Desk.fiftyMove >= 100) {
		 $("#GameStatus").text("GAME DRAWN {fifty move rule}"); 
		 return BOOL.TRUE;
	}
	
	if (ThreeFoldRep() >= 2) {
     	$("#GameStatus").text("GAME DRAWN {3-fold repetition}"); 
     	return BOOL.TRUE;
    }
	
	if (DrawMaterial() == BOOL.TRUE) {
     	$("#GameStatus").text("GAME DRAWN {insufficient material to mate}"); 
     	return BOOL.TRUE;
    }
    
    GenerateMoves();
      
    var MoveNum = 0;
	var found = 0;
	
	for(MoveNum = Desk.moveListStart[Desk.ply]; MoveNum < Desk.moveListStart[Desk.ply + 1]; ++MoveNum)  {	
       
        if ( MakeMove(Desk.moveList[MoveNum]) == BOOL.FALSE)  {
            continue;
        }
        found++;
		TakeMove();
		break;
    }
	
	if(found != 0) return BOOL.FALSE;
	
	var InCheck = SqAttacked(Desk.pList[PIECEINDEX(Kings[Desk.side],0)], Desk.side^1);
	
	if(InCheck == BOOL.TRUE) {
		if(Desk.side == COLOURS.WHITE) {
	      $("#GameStatus").text("GAME OVER {black mates}");
	      return BOOL.TRUE;
        } else {
	      $("#GameStatus").text("GAME OVER {white mates}");
	      return BOOL.TRUE;
        }
	} else {
		$("#GameStatus").text("GAME DRAWN {stalemate}");return BOOL.TRUE;
	}
	
	return BOOL.FALSE;	
}

function CheckAndSet() {
	if(CheckResult() == BOOL.TRUE) {
		GameController.GameOver = BOOL.TRUE;
	} else {
		GameController.GameOver = BOOL.FALSE;
		$("#GameStatus").text('');
	}
	if(Desk.side == COLOURS.WHITE) {
		$("#SideMove").text("Whites moves");
	} else {
		$("#SideMove").text("Blacks moves");
	}
}

function PreSearch() {
	if(GameController.GameOver == BOOL.FALSE && Desk.player == 1 ) {
		SearchController.thinking = BOOL.TRUE;
		setTimeout( function() { StartSearch(); }, 200 );
	}
}

$('#SearchButton').click( function () {	
	GameController.PlayerSide = GameController.side ^ 1;
	PreSearch();
});

function StartSearch() {

	SearchController.depth = MAXDEPTH;
	var t = $.now();
	var tt = $('#ThinkTimeChoice').val();
	
	SearchController.time = parseInt(tt) * 1000;
	SearchPosition();
	
	MakeMove(SearchController.best);
	MoveGUIPiece(SearchController.best);
	CheckAndSet();
}














































