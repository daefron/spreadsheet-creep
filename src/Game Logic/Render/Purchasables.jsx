import EntityList from "../Engine/Lists/EntityList.jsx";
export default function Purchasables() {
  let entityArray = Object.values(EntityList);
  let friendlyEntityArray = entityArray.filter(
    (entity) => !entity.enemy && entity.type !== "king"
  );
  let parsedFriendlyEntityArray = [
    [["Purchasable entities:"], [""], [""], [""], [""], [""], [""]],
    [["Name"], ["Level"], ["Cost"], ["HP"], ["Damage"], ["Range"], ["Rate"]],
  ];
  for (const entity of friendlyEntityArray) {
    let lvls = Object.values(entity.lvls);
    for (const lvl of lvls) {
      let name = "";
      if (lvl.lvl === 1) {
        name = entity.type;
      }
      let thisLevel = [
        [name],
        [lvl.lvl],
        [lvl.value],
        [lvl.hp],
        [lvl.dmg],
        [lvl.range],
        [lvl.rate],
      ];
      parsedFriendlyEntityArray.push(thisLevel);
    }
  }
  for (let i = 0; i < parsedFriendlyEntityArray.length; i++) {
    let row = parsedFriendlyEntityArray[i];
    for (let x = 0; x < row.length; x++) {
      let cell = row[x];
      cell.push(i + "x" + x + "purchasable");
    }
    if (i > 1) {
      if (row[0][0]) {
        row[0][2] = {
          borderTop: "solid 1px black",
        };
      }
    }
  }
  return (
    <table id="purchasables">
      <tbody>
        {parsedFriendlyEntityArray.map((row) => {
          return (
            <tr className="purchasableRow" key={row} style={row[0][2]}>
              {row.map((position) => {
                return (
                  <td key={position[1]}>
                    <input
                      id={position[1]}
                      className="purchasableCell"
                      type="text"
                      defaultValue={position[0]}
                      readOnly
                    ></input>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
