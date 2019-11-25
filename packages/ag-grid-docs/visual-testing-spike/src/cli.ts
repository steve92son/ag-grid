import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { runSuite } from './runner';
import { specs } from './specs';
import yargs from 'yargs';

const screenshotFolder = 'compare';

const args: any = yargs
    .strict()
    .command(
        '$0 <images>',
        'Run the test suite, generate new images, and either generate a reference set or compare them against an existing set',
        y =>
            y
                .positional('images', {
                    describe: 'Name of image set folder within ./compare'
                })
                .option('update', {
                    describe: 'Save generated images instead of comparing'
                })
                .option('server', {
                    describe: 'ag-grid-docs server to run against',
                    default: 'http://localhost:8080'
                })
                .option('report-file', {
                    describe: 'Where to save the HTML report',
                    default: 'report.html'
                })
                .option('filter', {
                    describe: 'Only generate/compare images with names containing this string',
                    type: 'string'
                })
                .option('force', {
                    describe: "Don't prompt for confirmation before overwriting images",
                    type: 'boolean'
                })
                .option('clean', {
                    describe:
                        'Delete all pre-existing images when updating. The default is to delete images only if there is no filter set.',
                    type: 'boolean'
                })
    ).argv;

/*
TODO

Specs:
Community menu
Complex header examples

*/

export const runCli = async (baseFolder: string) => {
    const folder = path.join(baseFolder, screenshotFolder, args.images);
    if (args.update && !args.force) {
        const result = await inquirer.prompt([
            {
                name: 'overwrite',
                type: 'confirm',
                message: `😰  ${chalk.bold.rgb(255, 128, 0)`DELETE ALL IMAGES`} in "${path.relative(
                    '.',
                    folder
                )}" and generate new ones?`
            }
        ]);
        if (!result.overwrite) {
            process.exit();
        }
    }
    try {
        await runSuite({
            folder,
            mode: args.update ? 'update' : 'compare',
            specs,
            themes: ['alpine', 'balham', 'material', 'fresh'],
            server: args.server,
            reportFile: args.reportFile,
            clean: !!args.clean,
            filter: args.filter || ''
        });
    } catch (e) {
        const message = e.specName ? `Error in spec ${e.specName}: ${e.stack}` : e.stack;
        console.error('ERROR:', message);
    }
};