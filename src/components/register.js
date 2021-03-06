import React from 'react';
import {View, Text, Dimensions,Modal, ScrollView, KeyboardAvoidingView, Image, TouchableWithoutFeedback, LayoutAnimation, Platform} from 'react-native';
import Background from './Background';
import { Icon, Avatar,Button, Header, Input } from 'react-native-elements'
import { colors } from '../common/theme';
import * as firebase from 'firebase'; //Database
var {  height, width } = Dimensions.get('window');
import  languageJSON  from '../common/language';
export default class Registration extends React.Component {
    
     constructor(props){
        super(props);
        this.state={
          fname:this.props.reqData?this.props.reqData.profile.first_name:'',
          lname:this.props.reqData?this.props.reqData.profile.last_name:'',
          email:this.props.reqData?this.props.reqData.profile.email:'',
          mobile:'',
          password:'',
          confPassword:'',
          refferalId:'',

          fnameValid: true,
          lnameValid: true,
          mobileValid: true,
          emailValid: true,
          passwordValid: true,
          cnfPwdValid: true,
          pwdErrorMsg: '',
          allInfo:'',
          reffralIdValid:true,
          loadingModal:false
        } 
      }

      componentDidMount(){
          setTimeout(() => {
            this.setState({allInfo:this.props.reqData?this.props.reqData:"no data found"},()=>{
                console.log("all informations are",this.state.allInfo);
            })
          }, 3000); 
      }
    
    // first name validation
    validateFirstName() {
        const { fname } = this.state
        const fnameValid = fname.length > 0
        LayoutAnimation.easeInEaseOut()
        this.setState({ fnameValid })
        fnameValid || this.fnameInput.shake();
        return fnameValid
    }

    validateLastname() {
        const { lname } = this.state
        const lnameValid = lname.length > 0
        LayoutAnimation.easeInEaseOut()
        this.setState({ lnameValid })
        lnameValid || this.lnameInput.shake();
        return lnameValid
    }

    // mobile number validation
    validateMobile() {
        const { mobile } = this.state
        const mobileValid = (mobile.length >0)
        LayoutAnimation.easeInEaseOut()
        this.setState({ mobileValid })
        mobileValid || this.mobileInput.shake();
        return mobileValid
    }

    // email validation
    validateEmail() {
        const { email } = this.state
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email)
        LayoutAnimation.easeInEaseOut()
        this.setState({ emailValid })
        emailValid || this.emailInput.shake()
        return emailValid
    }

    // password validation
    validatePassword() {
        const { complexity } = this.props
        const { password } = this.state
        const regx1 = /^([a-zA-Z0-9@*#]{8,15})$/
        const regx2 = /(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/
        if(complexity == 'any') {
            var passwordValid = password.length >=1;
            this.setState({pwdErrorMsg: languageJSON.password_blank_messege})
        }
        else if(complexity == 'alphanumeric') {
            var passwordValid = regx1.test(password);
            this.setState({pwdErrorMsg: languageJSON.password_alphaNumeric_check});
        }
        else if (complexity == 'complex') {
            var passwordValid = regx2.test(password);
            this.setState({pwdErrorMsg: languageJSON.password_complexity_check})
        }
        LayoutAnimation.easeInEaseOut()
        this.setState({ passwordValid })
        passwordValid || this.passwordInput.shake()
        return passwordValid
    } 

    // confirm password validation
    validateConfPassword() {
        const { password, confPassword } = this.state;
        const cnfPwdValid = (password == confPassword);
        LayoutAnimation.easeInEaseOut()
        this.setState({ cnfPwdValid })
        cnfPwdValid || this.cnfPwdInput.shake();
        return cnfPwdValid
    }

    

    //register button press for validation
    onPressRegister(){
        const { onPressRegister } = this.props;
        LayoutAnimation.easeInEaseOut();
        const fnameValid = this.validateFirstName();
        const lnameValid = this.validateLastname();
        const emailValid = this.validateEmail();
        const mobileValid = this.validateMobile();
        const passwordValid = this.validatePassword();
        const cnfPwdValid = this.validateConfPassword();
        
       if ( fnameValid && lnameValid && emailValid && mobileValid && passwordValid && cnfPwdValid) {
           
           if(this.state.refferalId != ''){
              this.setState({loadingModal:true})
               const userRoot=firebase.database().ref('users/');
               userRoot.once('value',userData=>{
                   if(userData.val()){
                       let allUsers = userData.val();
                       var flag = false;
                       for(key in allUsers){
                           if(allUsers[key].refferalId){
                               if(this.state.refferalId.toLowerCase() == allUsers[key].refferalId){
                                   flag = true;
                                   var referralVia = {
                                       userId:key,
                                       refferalId:allUsers[key].refferalId
                                   }
                                   break;
                               }else{
                                   flag = false;
                               }
                           }
                       }
                       if(flag == true){            
                         this.setState({reffralIdValid :true,loadingModal:false});
                         onPressRegister( this.state.fname, this.state.lname, this.state.email, this.state.mobile, this.state.password,true,referralVia);
                         this.setState({fname:'', lname:'',email: '', mobile:'',  password: '', confPassword: '',refferalId:''})
                       }else{     
                           this.refferalInput.shake();
                           this.setState({reffralIdValid :false,loadingModal:false});
                       }
                   }
                })
    
           }else{
               //refferal id is blank
                onPressRegister( this.state.fname, this.state.lname, this.state.email, this.state.mobile, this.state.password,false,null);
                this.setState({fname:'', lname:'',email: '', mobile:'',  password: '', confPassword: '',refferalId:''})
           }
           
        }
    }
    
    loading(){
     return(
        <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.loadingModal}
                onRequestClose={() => {
                this.setState({loadingModal:false})
            }}
            >
            <View style={{flex: 1, backgroundColor: "rgba(22,22,22,0.8)", justifyContent: 'center', alignItems: 'center' }}>
                <View style={{width: '85%', backgroundColor: "#DBD7D9", borderRadius: 10, flex: 1, maxHeight: 70}}> 
                <View style={{ alignItems: 'center',flexDirection:'row',flex:1,justifyContent:"center"}}>
                     <Image
                        style={{width:80,height:80,backgroundColor:colors.TRANSPARENT}}
                        source={require('../../assets/images/loader.gif')}
                        />
                   <View style={{flex:1}}>
                        <Text style={{color:"#000",fontSize:16,}}>{languageJSON.refferal_code_validation_modal}</Text>
                    </View>
                </View>
                </View>
            </View>
        </Modal>
     )
    }

    render(){

        const { onPressBack,registrationData,reqData, loading } = this.props

        return(
            <Background noBackImage={false}>
                <Header 
                    //backgroundColor={colors.BLUE.default}
                    leftComponent={{icon:'ios-arrow-back', type:'ionicon', color:colors.WHITE, size: 35, component: TouchableWithoutFeedback,onPress: onPressBack }}
                    centerComponent={{text: languageJSON.registration_title, style:styles.headerStyle}}
                    containerStyle={styles.headerContainerStyle}  
                    innerContainerStyles={styles.headerInnerContainer}
                />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.logo}>
                        <Image source={require('../../assets/images/logo.png')} 
                        style={{width: width/2.8, height: width/2.8, resizeMode:'contain'}}/>
                    </View>
                    <KeyboardAvoidingView behavior={Platform.OS=='ios'?"padding":"padding"} style={styles.form}> 
                        <View style={styles.containerStyle}>
                           {/*  <Text style={styles.headerStyle}>{languageJSON.registration_title}</Text> */}

                            <View style={styles.textInputContainerStyle}> 
                                
                                <Input
                                    leftIcon={<Icon
                                        name='person'
                                        //type='font-awesome'
                                        color={styles.iconColor}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />}
                                    leftIconContainerStyle={styles.leftIconContainerStyle}
                                    label="First Name"
                                    labelStyle={styles.labelStyle}
                                    ref={input => (this.fnameInput = input)}
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={languageJSON.first_name_placeholder}
                                    placeholderTextColor={styles.placeHolderColor}
                                    value={this.state.fname}
                                    keyboardType={'email-address'}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text)=>{this.setState({fname: text})}}
                                    errorMessage={this.state.fnameValid ? null : languageJSON.first_name_blank_error}
                                    secureTextEntry={false}
                                    blurOnSubmit={true}
                                    onSubmitEditing={() => { this.validateFirstName(); this.lnameInput.focus()}}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                />
                            </View>  

                            <View style={styles.textInputContainerStyle}>
                               
                                <Input
                                    leftIcon={<Icon
                                        name='person'
                                        //type='font-awesome'
                                        color={styles.iconColor}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />}
                                    leftIconContainerStyle={styles.leftIconContainerStyle}
                                    label="Last Name"
                                    labelStyle={styles.labelStyle}
                                    ref={input => (this.lnameInput = input)}
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={languageJSON.last_name_placeholder}
                                    placeholderTextColor={styles.placeHolderColor}
                                    value={this.state.lname}
                                    keyboardType={'email-address'}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text)=>{this.setState({lname: text})}}
                                    errorMessage={this.state.lnameValid ? null : languageJSON.last_name_blank_error}
                                    secureTextEntry={false}
                                    blurOnSubmit={true}
                                    onSubmitEditing={() => { this.validateLastname(); this.emailInput.focus()}}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                />
                            </View>

                            <View style={styles.textInputContainerStyle}>
                               
                                <Input
                                    leftIcon={<Icon
                                        name='email'
                                        //type='font-awesome'
                                        color={styles.iconColor}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />}
                                    leftIconContainerStyle={styles.leftIconContainerStyle}
                                    label="Email"
                                    labelStyle={styles.labelStyle}
                                    ref={input => (this.emailInput = input)}
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={languageJSON.email_placeholder}
                                    placeholderTextColor={styles.placeHolderColor}
                                    value={this.state.email}
                                    keyboardType={'email-address'}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text)=>{this.setState({email: text})}}
                                    errorMessage={this.state.emailValid ? null : languageJSON.valid_email_check}
                                    secureTextEntry={false}
                                    blurOnSubmit={true}
                                    onSubmitEditing={() => { this.validateEmail(); this.mobileInput.focus()}}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                />
                            </View>
                            <View style={styles.textInputContainerStyle}>
                                
                                <Input
                                    leftIcon={<Icon
                                        name='smartphone'
                                        //type='font-awesome'
                                        color={styles.iconColor}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />}
                                    leftIconContainerStyle={styles.leftIconContainerStyle}
                                    label="Phone"
                                    labelStyle={styles.labelStyle}
                                    ref={input => (this.mobileInput = input)}
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={languageJSON.mobile_no_placeholder}
                                    placeholderTextColor={styles.placeHolderColor}
                                    value={this.state.mobile}
                                    keyboardType={'number-pad'}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text)=>{this.setState({mobile: text})}}
                                    errorMessage={this.state.mobileValid ? null : languageJSON.mobile_no_blank_error}
                                    secureTextEntry={false}
                                    blurOnSubmit={true}
                                    onSubmitEditing={() => { this.validateMobile(); this.passwordInput.focus()}}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                />
                            </View>

                            <View style={styles.textInputContainerStyle}>
                               
                                <Input
                                    leftIcon={<Icon
                                        name='lock'
                                        //type='font-awesome'
                                        color={styles.iconColor}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />}
                                    leftIconContainerStyle={styles.leftIconContainerStyle}
                                    label="Password"
                                    labelStyle={styles.labelStyle}
                                    ref={input => (this.passwordInput = input)}
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={languageJSON.password_placeholder}
                                    placeholderTextColor={styles.placeHolderColor}
                                    value={this.state.password}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text)=>{this.setState({password: text})}}
                                    errorMessage={this.state.passwordValid ? null : this.state.pwdErrorMsg}
                                    secureTextEntry
                                    blurOnSubmit={true}
                                    onSubmitEditing={() => { this.validatePassword(); this.cnfPwdInput.focus()}}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                />
                            </View>

                            <View style={styles.textInputContainerStyle}>
                                
                                <Input
                                    leftIcon={<Icon
                                        name='lock'
                                        //type='font-awesome'
                                        color={styles.iconColor}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />}
                                    leftIconContainerStyle={styles.leftIconContainerStyle}
                                    label="Confirm Password"
                                    labelStyle={styles.labelStyle}
                                    ref={input => (this.cnfPwdInput = input)}
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={languageJSON.confrim_password_placeholder}
                                    placeholderTextColor={styles.placeHolderColor}
                                    value={this.state.confPassword}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text)=>{this.setState({confPassword: text})}}
                                    errorMessage={this.state.cnfPwdValid ? null : languageJSON.confrim_password_not_match_err}
                                    secureTextEntry
                                    blurOnSubmit={true}
                                    onSubmitEditing={() => { this.validateConfPassword(); this.refferalInput.focus() }}
                                    errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                />
                            </View>
                            <View style={styles.textInputContainerStyle}>
                               
                                 <Input
                                    leftIcon={<Icon
                                        name='lock'
                                        //type='font-awesome'
                                        color={styles.iconColor}
                                        size={23}
                                        containerStyle={styles.iconContainer}
                                    />}
                                    leftIconContainerStyle={styles.leftIconContainerStyle}
                                    label="Referral"
                                    labelStyle={styles.labelStyle}
                                    ref={input => (this.refferalInput = input)}
                                    editable={true}
                                    underlineColorAndroid={colors.TRANSPARENT}
                                    placeholder={languageJSON.referral_id_placeholder}
                                    placeholderTextColor={styles.placeHolderColor}
                                    value={this.state.refferalId}
                                    // keyboardType={'email-address'}
                                    inputStyle={styles.inputTextStyle}
                                    onChangeText={(text)=>{this.setState({refferalId: text})}}
                                    errorMessage={this.state.reffralIdValid == true ? null : languageJSON.refferal_id_not_match_error}
                                    secureTextEntry={false}
                                    blurOnSubmit={true}
                                   // onSubmitEditing={() => { this.validateRefferalId()}}
                                    // errorStyle={styles.errorMessageStyle}
                                    inputContainerStyle={styles.inputContainerStyle}
                                    containerStyle={styles.textInputStyle}
                                />
                            </View>
                            <View style={styles.buttonContainer}>
                                <Button
                                    onPress={()=>{this.onPressRegister()}}
                                    title={languageJSON.register_button}
                                    loading={loading}
                                    titleStyle={styles.buttonTitle}
                                    buttonStyle={styles.registerButton}
                                />
                            </View>
                            <View style={styles.gapView}/>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
                {this.loading()}
            </Background>
        ); 
    }
};

const styles={
    headerStyle:{
        fontSize:20,
        color:colors.WHITE,
        textAlign:'center',
        flexDirection:'row',
        marginTop:0
    },
    headerContainerStyle: { 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.TRANSPARENT, 
        borderBottomWidth: 0 ,
        marginTop:0,
        paddingBottom: 10
    },
    placeHolderColor: colors.GREY.light_Grey,
    headerInnerContainer: {
        marginLeft:10, 
        marginRight: 10,
    },
    iconContainer: {
        //paddingTop:8
        //backgroundColor: colors.BLUE.default,
    },
    iconColor: colors.WHITE,
    leftIconContainerStyle: {
        marginLeft: 0, 
        marginRight: 10
    },
    labelStyle: {
        color: colors.WHITE,
    },
    gapView: {
        height:60,
        width:'100%'
    },
    buttonContainer: { 
        flexDirection:'row',
        justifyContent:'center',
        marginBottom: 20,
        //borderRadius:40
    },
    registerButton: {
        backgroundColor: colors.SKY,
        width: 180,
        height: 50,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        marginTop:30,
        borderRadius:5,
    },
    buttonTitle: { 
        fontSize:16 
    },
    inputContainerStyle: {
        borderBottomWidth:1,
        borderBottomColor: colors.SKY
    },
    textInputStyle:{
        //marginLeft:10,
    },
    inputTextStyle: {
        color:colors.WHITE,
        fontSize:17,
        marginLeft:0,
        height:32,
    },
    errorMessageStyle: { 
        fontSize: 14, 
        //fontWeight:'bold',
        marginLeft:0 ,
        color:colors.WHITE,
        fontStyle: 'italic'
    },
    containerStyle:{
        flexDirection:'column',
        marginTop:20,
        marginHorizontal: 8
    },
    form: {
        flex: 1,
        alignItems: 'center'
    },
    logo:{
        flex: 0.3,
        justifyContent:"center",
        marginTop:10,
        alignItems:'center', 
    },
    scrollViewStyle:{
        height: height
    },
    textInputContainerStyle:{
        flexDirection:'row', 
        alignItems: "center",  
        justifyContent: "center",
        //marginLeft:3,
       // marginRight:20,
        padding: 5,
        marginBottom: 42,
    },
    
}