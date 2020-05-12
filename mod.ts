import { readFileStr } from "https://deno.land/std/fs/read_file_str.ts";
import { writeFileStr } from "https://deno.land/std/fs/write_file_str.ts";
import { exists } from "https://deno.land/std/fs/exists.ts";
const { mkdir, remove } = Deno;

const regions = ["NA", "EU", "SA", "AUS", "SEA"];
const brackets = ["1v1", "2v2"];
const prDate = "Spring 2020";

if (!await exists("dist")) await mkdir("dist");

const outputPath = `dist/${prDate}`;

if (await exists(outputPath)) {
  await remove(outputPath, { recursive: true });
}

await mkdir(outputPath);

regions.forEach((r) => {
  brackets.forEach(async (b) => {
    console.log(`${r} ${b}\n    => Starting format...`);
    const filename = `${r} ${b} - ${prDate}`;

    const rawTxt = await readFileStr(`src/${prDate}/${filename}.csv`);
    const lines = rawTxt.split("\n").map((x) => x.split(","));

    const prFormat = lines[0].map((_, i) => {
      if (i == 0) return;

      let j = 0;
      let player: { [k in string]: number | string } = {
        pr: i,
        name: lines[j++][i],
        t32: lines[j++][i],
        t8: lines[j++][i],
        t3: lines[j++][i],
        t2: lines[j++][i],
        t1: lines[j++][i],
      };

      j++; // Empty line

      player.totalPoints = lines[j++][i];

      j += 2; // Two Empty lines

      let tourneys: { [k in string]: number | string }[] = [];
      while (j < lines.length) {
        let tourney = {
          name: lines[j++][0],
          place: lines[j++][i],
          points_from_place: lines[j++][i],
          wins: lines[j++][i],
          points_from_wins: lines[j++][i],
          losses: lines[j++][i],
          points_from_losses: lines[j++][i],
          base_total: lines[j++][i],
          points_after_weight: lines[j++][i],
          final_points_recency: lines[j++][i],
        };
        tourneys = [...tourneys, tourney];
        j++;
      }
      return { ...player, tourneys };
    });

    console.log(
      `${r} ${b}\n    => File successfully formatted\n    => Writing file to disc...`,
    );

    await writeFileStr(
      `${outputPath}/${filename}.json`,
      JSON.stringify(prFormat.slice(1), null, 4),
    );
    console.log(
      `${r} ${b}\n    => File successfully created!`,
    );
  });
});
