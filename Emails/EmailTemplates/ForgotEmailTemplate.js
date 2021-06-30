const ForgotPasswordTemplate = (
    fullName,
    subject,
    $settingsObj,
    token
) => {
    var $overPass = "'Overpass', sans-serif";
    var $cursive = "'Indie Flower', cursive";
    return `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Welcome To ${$settingsObj.site_name}</title>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Indie+Flower&family=Overpass:ital@1&family=Staatliches&display=swap" rel="stylesheet">
    <style>
        /* -------------------------------------
          INLINED WITH htmlemail.io/inline
      ------------------------------------- */
        /* -------------------------------------
          RESPONSIVE AND MOBILE FRIENDLY STYLES
      ------------------------------------- */
        @media only screen and (max-width: 620px) {
            table[class="body"] h1 {
                font-size: 28px !important;
                margin-bottom: 10px !important;
            }
            table[class="body"] p,
            table[class="body"] ul,
            table[class="body"] ol,
            table[class="body"] td,
            table[class="body"] span,
            table[class="body"] a {
                font-size: 16px !important;
            }
            table[class="body"] .wrapper,
            table[class="body"] .article {
                padding: 10px !important;
            }
            table[class="body"] .content {
                padding: 0 !important;
            }
            table[class="body"] .container {
                padding: 0 !important;
                width: 100% !important;
            }
            table[class="body"] .main {
                border-left-width: 0 !important;
                border-radius: 0 !important;
                border-right-width: 0 !important;
            }
            table[class="body"] .btn table {
                width: 100% !important;
            }
            table[class="body"] .btn a {
                width: 100% !important;
            }
            table[class="body"] .img-responsive {
                height: auto !important;
                max-width: 100% !important;
                width: auto !important;
            }
        }

        /* -------------------------------------
          PRESERVE THESE STYLES IN THE HEAD
      ------------------------------------- */
        @media all {
            .ExternalClass {
                width: 100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
                line-height: 100%;
            }
            .apple-link a {
                color: inherit !important;
                font-family: inherit !important;
                font-size: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
                text-decoration: none !important;
            }
            #MessageViewBody a {
                color: inherit;
                text-decoration: none;
                font-size: inherit;
                font-family: inherit;
                font-weight: inherit;
                line-height: inherit;
            }
            .btn-primary table td:hover {
                background-color: #34495e !important;
            }
            .btn-primary a:hover {
                background-color: #34495e !important;
                border-color: #34495e !important;
            }
        }
    </style>
</head>
<body
        class=""
        style="
    background-color: #ddd;
    font-family: sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
    line-height: 1.4;
    margin: 0;
    padding: 0;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    "
>
<span
        class="preheader"
        style="
    color: transparent;
    display: none;
    height: 0;
    max-height: 0;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    mso-hide: all;
    visibility: hidden;
    width: 0;
    "
>Welcome To ${$settingsObj.site_name}.</span
>
<table
        border="0"
        cellpadding="0"
        cellspacing="0"
        class="body"
        style="
    border-collapse: separate;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: 100%;
    background-color: #ddd;
    "
>

    <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top"
        >
            &nbsp;
        </td>
        <td
                class="container"
                style="
    font-family: sans-serif;
    font-size: 14px;
    vertical-align: top;
    display: block;
    margin: 0 auto;
    max-width: 580px;
    padding: 10px;
    width: 580px;
    "
        >
            <div
                    class="content"
                    style="
    box-sizing: border-box;
    display: block;
    margin: 0 auto;
    max-width: 580px;
    padding: 10px;
    "
            >
                <!-- START CENTERED WHITE CONTAINER -->
                <table
                        class="main"
                        style="
    border-collapse: separate;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: 100%;
    background: #ffffff;
    border-radius: 3px;
    "
                >
                    <!-- START MAIN CONTENT AREA -->


                    <tr>
                        <td
                                class="wrapper"
                                style="
    font-family: sans-serif;
    font-size: 14px;
    vertical-align: top;
    box-sizing: border-box;
    padding: 20px;
    "
                        >
                            <table
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="
    border-collapse: separate;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: 100%;
    "
                            >
                                <tr>
                                    <td
                                            style="
    font-family: sans-serif;
    font-size: 14px;
    vertical-align: top;
    "
                                    >
                                        <div
                                                style="
    font-family: sans-serif;
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    margin-bottom: 15px;
    height: auto;
    width: 100%;
    background-color:#ddd;
    padding-top: 10px;
    padding-bottom: 10px; border-bottom: 2px solid #1B1717; background: url(${$settingsObj.site_url+'/email_files/background-landscape.png'}); background-position: center; background-size: cover;"
                                        >
                                            <!--           background-landscape.png                                 //ios_url,android_url-->
                                            <h2 style="text-align: left; text-transform: uppercase; font-family: ${$overPass}; margin-bottom: 5px; padding-left: 10px; ">
                                                <span style="color:rgb(10, 4, 60);">${$settingsObj.site_name}</span>
                                            </h2>
                                            <h2 style="text-align: left; text-transform: uppercase; padding-left: 10px; font-family: ${$cursive}; margin-top: 5px;">
                                                <!--<span style="color:rgb(10, 4, 60);">SURE HOME</span>--> ${$settingsObj.slogan.toUpperCase()}</h2>

                                            <h3 align="center">${subject}</h3>
                                            <div align="center">
                                                <img
                                                        src="${$settingsObj.logo_url}"
                                                        style="width: 100px"
                                                />
                                            </div>
                                        </div>
                                        <p
                                                style="
    font-family: sans-serif;
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    margin-bottom: 15px;
    "
                                        >
                                            Hi ${fullName},
                                        </p>
                                        <p
                                                style="
    font-family: sans-serif;
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    margin-bottom: 15px;
    "
                                        >
                                            We have received a password reset request from your account with ${$settingsObj.site_name}. Below is a four digit code to use and unlock the ability to reset your account's password.
    </p>
    <table
    border="0"
    cellpadding="0"
    cellspacing="0"
class="btn btn-primary"
    style="
    border-collapse: separate;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: 100%;
    box-sizing: border-box;
    "
    >
    <tbody>
    <tr>
    <td
    align="left"
    style="
    font-family: sans-serif;
    font-size: 14px;
    vertical-align: top;
    padding-bottom: 15px;
    "
    >
    <table
    border="0"
    cellpadding="0"
    cellspacing="0"
    style="
    border-collapse: separate;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: auto;
    "
    >
    <tbody>
    <tr>
    <td
    style="
    font-family: sans-serif;
    font-size: 14px;
    vertical-align: top;
    background-color: #3498db;
    border-radius: 5px;
    text-align: center;
    "
    >
    <button
    href="button"
    style="
    display: inline-block;
    color: #ffffff;
    background-color: #3498db;
    border: solid 1px #3498db;
    border-radius: 5px;
    box-sizing: border-box;
    cursor: pointer;
    text-decoration: none;
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    padding: 12px 25px;
    text-transform: capitalize;
    border-color: #3498db;
    ">${token}</button>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <div style="width:100%; margin-bottom: 10px;">
        <p>Download our mobile apps, follow the link below</p>
    <div style="width: 40%; display: inline-block;">
        <a href="${$settingsObj.ios_url}" ><img src="${$settingsObj.site_url}/email_files/android.png" style="width:100%;" /></a>
        </div>
        <div style="width: 40%; display: inline-block;">
        <a href="${$settingsObj.android_url}" ><img src="${$settingsObj.site_url}/email_files/ios.png" style="width:100%;" /></a>
        </div>
        </div>


        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Provide code on box provided to continue. Token expires in ${$settingsObj.expiration_time} minutes
</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0;
    margin-bottom: 15px; ">
    Regards! ${$settingsObj.site_name}.
</p>
    </td>
    </tr>
    </table>
    </td>
    </tr>

    <!-- END MAIN CONTENT AREA -->
    </table>

    <!-- START FOOTER -->
    <div
class="footer"
    style="
    clear: both;
    margin-top: 10px;
    text-align: center;
    width: 100%;
    "
    >
    <table
    border="0"
    cellpadding="0"
    cellspacing="0"
    style="
    border-collapse: separate;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: 100%;
    "
    >
    <tr>
    <td
class="content-block"
    style="
    font-family: sans-serif;
    vertical-align: top;
    padding-bottom: 10px;
    padding-top: 10px;
    font-size: 12px;
    color: #999999;
    text-align: center;
    "
    >
    <span
class="apple-link"
    style="
    color: #999999;
    font-size: 12px;
    text-align: center;
    "
    >${$settingsObj.address1}</span
    >
    <!--                                    <br />--}}
{{--                                    Don't like these emails?--}}
    {{--                                    <a--}}
    {{--                                            href="http://i.imgur.com/CScmqnj.gif"--}}
    {{--                                            style="--}}
        {{--                        text-decoration: underline;--}}
        {{--                        color: #999999;--}}
        {{--                        font-size: 12px;--}}
        {{--                        text-align: center;--}}
        {{--                      "--}}
            {{--                                    >Unsubscribe</a>.-->
            </td>
            </tr>
            <tr>
            <td
            class="content-block powered-by"
                style="
                font-family: sans-serif;
                vertical-align: top;
                padding-bottom: 10px;
                padding-top: 10px;
                font-size: 12px;
                color: #999999;
                text-align: center;
                "
                >
                <!--Powered by-->
                <a href="${$settingsObj.site_url}" style="
                color: #999999;
                font-size: 12px;
                text-align: center;
                text-decoration: none;
                " >${$settingsObj.site_name.toUpperCase()}</a
                >.
            </td>
                </tr>
                </table>
                </div>
                <!-- END FOOTER -->

                <!-- END CENTERED WHITE CONTAINER -->
                </div>
                </td>
                <td
                style="font-family: sans-serif; font-size: 14px; vertical-align: top"
                    >
                    &nbsp;
            </td>
                </tr>
                </table>
                </body>
                </html>`;
            };
                module.exports = ForgotPasswordTemplate;
