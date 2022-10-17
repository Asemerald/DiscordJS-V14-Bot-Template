const { EmbedBuilder } = require('discord.js');
const request = require('postman-request');
const config = require('../../../config/config.js');

//Pick a template from https://api.imgflip.com/get_memes and edit it then send it to the user
module.exports = {
    name: 'meme',
    description: 'Sends a meme',
    type: 1,
    options: [
        {
            name: 'template',
            description: 'The template to use',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'The Rock Driving',
                    value: '181913649'
                },
                {
                    name: 'Two Buttons',
                    value: '87743020'
                },
                {
                    name: 'Change My Mind',
                    value: '129242436'
                },
                {
                    name: 'Expanding Brain',
                    value: '124822590'
                }

            ]
        },
        {
            name: 'texte-1',
            description: 'Text du haut ou premier texte',
            type: 3,
            required: true
        },
        {
            name: 'texte-2',
            description: 'Text du bas ou second texte (si la template en a un)',
            type: 3,
            required: false
        }
    ],
    permissions: {
        DEFAULT_MEMBER_PERMISSIONS: 'SendMessages'
    },
    run: async (client, interaction, config, db) => {
        const template = interaction.options.getString('template');
        const text0 = interaction.options.getString('texte-1');
        const text1 = interaction.options.getString('texte-2');

        if (!template) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('You need to specify a template!')
                ],
                ephemeral: true
            });
        }

        request.post( //Send a request to the imgflip api to caption the image
            {
                url: 'https://api.imgflip.com/caption_image',
                form: {
                    template_id: template,
                    username: config.Imgflip.USERNAME,
                    password: config.Imgflip.PASSWORD,
                    text0: text0,
                    text1: text1
                }
            },
           
            (error, response, body) => {
                if (error) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Erreur')
                                .setDescription('jsp ce que t\'as fait mais t\'as tout cassé')
                        ],
                        ephemeral: true
                    });
                }

                const data = JSON.parse(body);

                if (!data.success) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Erreur')
                                .setDescription('Rajoute du texte mec')
                                .setColor('#ED4245')
                        ],
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Meme')
                            .setImage(data.data.url)
                    ],
                    ephemeral: true
                });
            }
        );
    }
};


