const { EmbedBuilder } = require('discord.js');
const request = require('postman-request');
const config = require('../../../config/config.js');

//Pick a template from https://api.imgflip.com/get_memes and add text to it with boxes and send it to the user



module.exports = {
    name: 'truememe',
    description: 'Sends a meme',
    type: 1,
    options: [
        {
            name: 'template',
            description: 'Choisis ta template bg',
            type: 3,
            required: true,
            choices: [ //Add all templates available as choices
                {
                    name: 'Running Away Balloon - Le même du gars violet qui empeche le mec d\'attraper son ballon',
                    value: '131087935'
                }
            ]
        },
//add more options for more text boxes
        {
            name: 'text1',
            description: 'La légende du mec principal qui attrape le ballon',
            type: 3,
            required: true
        },
        {
            name: 'text2',
            description: 'La légende du ballon',
            type: 3,
            required: true
        },
        {
            name: 'text3',
            description: 'La légende du mec qui empeche le mec principal d\'attraper le ballon',
            type: 3,
            required: true
        },
    ],
    permissions: {
        DEFAULT_MEMBER_PERMISSIONS: 'SendMessages'
    },
    run: async (client, interaction, config, db) => {
        const template = interaction.options.getString('template');
        const text0 = interaction.options.getString('text1');
        const text1 = interaction.options.getString('text2');
        const text2 = interaction.options.getString('text3');



        if (!template) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder() //If no template is specified, send an error message
                        .setTitle('Error')
                        .setDescription('Jsp comment t\'as fait mais t\'as réussi à faire une erreur en faisant une commande qui envoie un meme')
                        .setColor('Red')
                ],
                ephemeral: true
            });
        }

        request.post( //Send a request to the imgflip api to caption the image with boxes
            {
                url: 'https://api.imgflip.com/caption_image', //Imgflip api url
                form: {
                    template_id: template,
                    username: config.Imgflip.USERNAME,
                    password: config.Imgflip.PASSWORD,     //Add text to custom boxes
                    boxes: [
                        {
                            "text": `${text0}`,
                            "x": 75,
                            "y": 300,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text1}`,	
                            "x": 550,
                            "y": 150,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text2}`,	
                            "x": 30,
                            "y": 620,
                            "width": 250,
                            "height": 250,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text0}`,	
                            "x": 275,
                            "y": 850,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        },
                        {
                            "text": `${text1}`,	
                            "x": 600,
                            "y": 600,
                            "width": 150,
                            "height": 150,
                            "color": "#ffffff",
                            "outline_color": "#000000"
                        }
                    ]
                }
            },     
            (error, response, body) => {
                if (error) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder() //If there is an error, send it to the user
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
                            new EmbedBuilder() //If the request failed, send an error message
                                .setTitle('Erreur')
                                .setDescription(`Une erreur est survenue: ${data.error_message}`)
                                .setColor('#ED4245')
                        ],
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Voici ton meme bg')  //Send the meme to the user
                            .setImage(data.data.url)
                    ],
                    ephemeral: true
                });
            }
        );
    }
};


