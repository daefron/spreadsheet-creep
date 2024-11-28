export function handleScroll(gamestate) {
  let gameboardWidth = gamestate.settings.gameboardWidth;
  let gameboardHeight = gamestate.settings.gameboardHeight;
  let renderWidth = gamestate.render.renderWidth;
  let renderWidthMin = gamestate.render.renderWidthMin;
  let renderHeight = gamestate.render.renderHeight;
  let renderHeightMin = gamestate.render.renderHeightMin;
  let scrolledThisTurn = gamestate.render.scrolledThisTurn;
  let scrollPositionX = gamestate.render.scrollPositionX;
  let scrollPositionY = gamestate.render.scrollPositionY;
  let cellWidth = gamestate.render.cellWidth;
  let cellHeight = gamestate.render.cellHeight;
  let board = document.getElementById("gameboardHolder");
  if (!scrolledThisTurn.current) {
    let left = board.scrollLeft;
    let width = board.offsetWidth;
    let scrollWidth = board.scrollWidth;
    if (left + width >= scrollWidth) {
      scrollEndX(
        gameboardWidth,
        renderWidth,
        renderWidthMin,
        scrollPositionX,
        scrolledThisTurn,
        cellWidth
      );
    } else if (!left) {
      scrollStartX(
        renderWidth,
        renderWidthMin,
        scrollPositionX,
        scrolledThisTurn,
        cellWidth
      );
    }
    let top = board.scrollTop;
    let height = board.offsetHeight;
    let scrollHeight = board.scrollHeight;
    if (top + height >= scrollHeight) {
      scrollEndY(
        gameboardHeight,
        renderHeight,
        renderHeightMin,
        scrollPositionY,
        scrolledThisTurn
      );
    } else if (!top) {
      scrollStartY(
        renderHeight,
        renderHeightMin,
        scrollPositionY,
        scrolledThisTurn,
        cellHeight
      );
    }
  }

  function scrollEndX(
    gameboardWidth,
    renderWidth,
    renderWidthMin,
    scrollPositionX,
    scrolledThisTurn,
    cellWidth
  ) {
    if (renderWidth.current < gameboardWidth.current) {
      renderWidthMin.current++;
      renderWidth.current++;
      scrollPositionX.current = -cellWidth.current;
      scrolledThisTurn.current = true;
    }
  }

  function scrollStartX(
    renderWidth,
    renderWidthMin,
    scrollPositionX,
    scrolledThisTurn,
    cellWidth
  ) {
    if (renderWidthMin.current > 0) {
      renderWidthMin.current--;
      renderWidth.current--;
      scrollPositionX.current = cellWidth.current;
      scrolledThisTurn.current = true;
    }
  }

  function scrollEndY(
    gameboardHeight,
    renderHeight,
    renderHeightMin,
    scrollPositionY,
    scrolledThisTurn
  ) {
    if (renderHeight.current < gameboardHeight.current) {
      renderHeightMin.current++;
      renderHeight.current++;
      scrollPositionY.current = -1;
      scrolledThisTurn.current = true;
    }
  }

  function scrollStartY(
    renderHeight,
    renderHeightMin,
    scrollPositionY,
    scrolledThisTurn,
    cellHeight
  ) {
    if (renderHeightMin.current > 0) {
      renderHeightMin.current--;
      renderHeight.current--;
      scrollPositionY.current = cellHeight.current - 1;
      scrolledThisTurn.current = true;
    }
  }
}

export function scrollCheck(gamestate) {
  let scrolledThisTurn = gamestate.render.scrolledThisTurn;
  let scrollPositionX = gamestate.render.scrollPositionX;
  let scrollPositionY = gamestate.render.scrollPositionY;
  let board = document.getElementById("gameboardHolder");
  if (scrollPositionX.current) {
    board.scrollBy(scrollPositionX.current, 0);
    scrollPositionX.current = 0;
    scrolledThisTurn.current = false;
  }
  if (scrollPositionY.current) {
    board.scrollBy(0, scrollPositionY.current);
    scrollPositionY.current = 0;
    scrolledThisTurn.current = false;
  }
}

export function xScrollUpdate(gamestate) {
  let gameboardWidth = gamestate.settings.gameboardWidth;
  let renderWidth = gamestate.render.renderWidth;
  let renderWidthMin = gamestate.render.renderWidthMin;
  let cellWidth = gamestate.render.cellWidth;
  let board = document.getElementById("gameboardHolder");
  let width = board.offsetWidth - 3;
  let xScroll = document.getElementById("xScroll");
  let totalWidth = (gameboardWidth.current - 1) * cellWidth.current + 50;
  let xScrollPercentage = width / totalWidth;
  let xScrollWidth = width * xScrollPercentage;
  if (xScrollWidth > width) {
    xScrollWidth = width;
  }
  xScroll.style.width = xScrollWidth + "px";
  let divider =
    gameboardWidth.current - (renderWidth.current - renderWidthMin.current);
  let baselineMargin = (width - xScrollWidth) / divider;
  let marginMultiplier = renderWidthMin.current;
  xScroll.style.marginLeft = baselineMargin * marginMultiplier + "px";
}

export function yScrollUpdate(gamestate) {
  let gameboardHeight = gamestate.settings.gameboardHeight;
  let renderHeight = gamestate.render.renderHeight;
  let renderHeightMin = gamestate.render.renderHeightMin;
  let cellHeight = gamestate.render.cellHeight;
  let board = document.getElementById("gameboardHolder");
  let height = board.offsetHeight - 2;
  let yScroll = document.getElementById("yScroll");
  let totalHeight = (gameboardHeight.current - 2) * cellHeight.current;
  let yScrollPercentage = height / totalHeight;
  let yScrollHeight = height * yScrollPercentage;
  if (yScrollHeight > height) {
    yScrollHeight = height;
  }
  yScroll.style.height = yScrollHeight + "px";
  let divider =
    gameboardHeight.current - (renderHeight.current - renderHeightMin.current);
  let baselineMargin = (height - yScrollHeight) / divider;
  let marginMultiplier = renderHeightMin.current;
  yScroll.style.marginTop = baselineMargin * marginMultiplier + "px";
}

export function cellOverlap(gamestate) {
  let selectedCell = gamestate.input.selectedCell;
  if (!selectedCell.current) {
    return;
  }
  let renderWidthMin = gamestate.render.renderWidthMin;
  let renderHeightMin = gamestate.render.renderHeightMin;
  let cellWidth = gamestate.render.cellWidth;
  let cellHeight = gamestate.render.cellHeight;
  let position = selectedCell.current.id.split("x");
  let left = selectedCell.current.getBoundingClientRect().left;
  let top = selectedCell.current.getBoundingClientRect().top;
  let elementOnTop = document.elementFromPoint(left, top);
  let xHeader = document.getElementById(
    renderWidthMin.current + "x" + position[1]
  );
  if (elementOnTop === xHeader) {
    let board = document.getElementById("gameboardHolder");
    board.scrollBy(-50, 0);
    let gap = board.scrollLeft;
    if (gap % cellWidth.current) {
      let loop;
      while (!loop) {
        gap -= cellWidth.current;
        if (gap < 0) {
          loop = true;
        }
      }
      board.scrollBy(0, -gap);
    }
  }
  let yHeader = document.getElementById(
    position[0] + "x" + renderHeightMin.current
  );
  if (elementOnTop === yHeader) {
    let board = document.getElementById("gameboardHolder");
    board.scrollBy(0, -cellHeight.current);
    let gap = board.scrollTop;
    if (gap % cellHeight.current) {
      let loop;
      while (!loop) {
        gap -= cellHeight.current;
        if (gap < 0) {
          loop = true;
        }
      }
      board.scrollBy(0, -gap);
    }
  }
}

export function autoCell(gamestate) {
  let renderWidth = gamestate.render.renderWidth;
  let renderWidthMin = gamestate.render.renderWidthMin;
  let renderHeight = gamestate.render.renderHeight;
  let renderHeightMin = gamestate.render.renderHeightMin;
  let cellWidth = gamestate.render.cellWidth;
  let cellHeight = gamestate.render.cellHeight;
  let board = document.getElementById("gameboardHolder");
  let width = board.offsetWidth;
  let height = board.offsetHeight;
  renderWidth.current =
    2 + parseInt(width / cellWidth.current) + renderWidthMin.current;
  renderHeight.current =
    2 + parseInt(height / cellHeight.current) + renderHeightMin.current;
}
