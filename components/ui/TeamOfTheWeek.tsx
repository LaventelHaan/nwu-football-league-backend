"use client"

// Grid row functions
function getPlayerGridRow(position: string) {
  switch (position) {
    case "GK":
      return 6 // bottom row
    case "LB":
    case "LCB":
    case "RCB":
    case "RB":
      return 5 // defenders
    case "LCM":
    case "CM":
    case "RCM":
      return 3 // midfielders
    case "LW":
    case "ST":
    case "RW":
      return 2 // attackers
    default:
      return 4
  }
}
// grid Col functions
function getPlayerGridCol(position: string) {
  switch (position) {
    // Goalkeeper (center bottom)
    case "GK":
      return 4

    // Defenders (4 across the back line)
    case "LB":
      return 1
    case "LCB":
      return 3
    case "RCB":
      return 5
    case "RB":
      return 7

    // Midfielders (3 across the middle line)
    case "LCM":
      return 2
    case "CM":
      return 4
    case "RCM":
      return 6

    // Attackers (3 across the front line)
    case "LW":
      return 1
    case "ST":
      return 4
    case "RW":
      return 7

    default:
      return 4
  }
}


export default function TeamOfTheWeek({ team }: { team: any }) {
  return (
    <section className="relative bg-gradient-to-br from-background via-muted/5 to-background rounded-3xl p-10 shadow-xl border border-muted/20 backdrop-blur-sm mt-12">
      <h2 className="text-3xl font-bold text-center mb-10">🏆 Team of the Week</h2>

      {/* Pitch Layout */}
      <div className="relative w-full h-[600px] bg-green-700 rounded-2xl shadow-inner border-4 border-green-900 grid grid-rows-6 grid-cols-7 gap-2 p-4">
        {team.players.map((player: any, index: number) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center text-center text-white font-semibold"
            style={{
              gridColumn: getPlayerGridCol(player.position),
              gridRow: getPlayerGridRow(player.position),
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shadow-lg">
              {player.position}
            </div>
            <div className="mt-2 text-sm">{player.name}</div>
            <div className="text-xs text-gray-200">{player.team}</div>
          </div>
        ))}
      </div>

      {/* Coach */}
      <div className="mt-10 text-center">
        <h3 className="text-xl font-bold mb-2">👔 Coach of the Week</h3>
        <p className="text-lg font-semibold">{team.coach.name} ({team.coach.team})</p>
        <p className="text-sm text-muted-foreground mt-1">{team.coach.reason}</p>
      </div>
    </section>
  )
}
