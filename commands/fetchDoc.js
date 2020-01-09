const {prefix} = require('../config');
const rp = require('request-promise');
const $ = require('cheerio');

module.exports = {
    name: 'fetchdoc',
    aliases: ['fd'],
    description: 'Cherche la documentation de la notion précisée dans le langage précisé.',
    args: true,
    usage: '<langage> <notion>',
    guildOnly: false,
    cooldown: 0,
    execute(message, args) {
        if (!args[1]) return message.channel.send(`\nLa bonne syntaxe est : \`${prefix}${this.name} ${this.usage}\``);
        if (args[0].toLowerCase() === 'php' && args[1]) {
            //Tout ce qui concerne la documentation PHP

            const url = `https://www.php.net/fr/${args[1]}`;

            rp(url)
                .then(html => {
                    //success!
                    const myLoader = $.load(html);
                    if($('.methodsynopsis', html).length === 0){
                        const closestMatch = $('#quickref_functions > li', html).eq(0).text();
                        message.reply("Il semblerait que cette fonction n\'existe pas..." +
                            `\nRésultat le plus proche : **${closestMatch}**`);
                        return this.execute(message, ['php', closestMatch]);

                    }
                    const refName = $('.refname', html).eq(0).text().trim();
                    const description = $('.dc-title', html).text().trim() ;
                    let syntax = '';
                    for (let i = 0; i < $('.methodsynopsis', html).length; i++){
                        let tab = $('.methodsynopsis', html).eq(i).text().trim().replace(',','é').split(/\n */);
                        let tab2 = '';
                        for (let j = 0; j < tab.length; j++)
                        {
                            tab2 += tab[j].replace('\,', '');
                        }
                        tab2 = tab2.replace('é', ',');
                        tab2 = tab2.replace('[', ' [');
                        tab2 = tab2.replace('(',' (');
                        tab2 = tab2.replace(']', ' ]');
                        tab2 = tab2.replace(')',' )');
                        tab2 = tab2.replace('  ', ' ');
                        syntax += `\n ${tab2}`;

                    }
                    message.channel.send("__Fonction :__\n"+
                        "**"+ refName + "** :arrow_right: `" + description +"`"+
                        "\n__Syntaxe :__\n"+
                        "```c++\n"+
                        syntax+
                        "```");
                    return message.reply(`https://www.php.net/${args[1]}`);
                })
                .catch(err =>{
                    //handle error
                    console.log(err);
                });


        }

    }
};