<?php

namespace App\Http\Controllers;

use App\Question;
use App\Answer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Cookie;

class HomeController extends Controller
{

    protected $token;
    protected $userCookie;

    private const LAST_RESPONSE = array(
        'code'      =>  200,
        'ask'   => "LAST_RESPONSE",
        'type' => "text",
        "nullQuestion" => null
    );

    private function getNullQuestionResponse(Question $question,$null_questions, $nullQuestion,$token=null, $userInput=null){
        if(count($null_questions)-1 >= $nullQuestion){
            $answers = $question->where('parent_item_id', '=', $null_questions[$nullQuestion]->id)->get();

            if(count($answers) !== 0){
                foreach ($answers as $answer){
                    $user_answers[] = $answer->item_text;
                }
                if($token && $userInput!==null){
                    $storeAnswer = new Answer();
                    $storeAnswer->user_token = $token;
                    $storeAnswer->question_id = $null_questions[$nullQuestion-1]["id"];
                    $storeAnswer->answer = $userInput;
                    $storeAnswer->save();
                }
                return response()->json(array(
                    'code'      =>  200,
                    'ask'   => $null_questions[$nullQuestion]->item_text,
                    'answer' => $user_answers,
                    'type'=>"text",
                    "nullQuestion" => $nullQuestion
                ), 200);
            }else{
                if($token && $userInput!==null){
                    $storeAnswer = new Answer();
                    $storeAnswer->user_token = $token;
                    $storeAnswer->question_id = $null_questions[$nullQuestion-1]["id"];
                    $storeAnswer->answer = $userInput;
                    $storeAnswer->save();
                }
                return response()->json(array(
                    'code'      =>  200,
                    'ask'   => $null_questions[$nullQuestion]->item_text,
                    'type' => "input",
                    'type_input' => $null_questions[$nullQuestion]->input_type,
                    "nullQuestion" => $nullQuestion+1
                ), 200);
            }
        }
        if($token && $userInput!==null){

            $storeAnswer = new Answer();
            $storeAnswer->user_token = $token;
            $storeAnswer->question_id = $storeAnswer->question_id = $null_questions[$nullQuestion-1]["id"];
            $storeAnswer->answer = $userInput;
            $storeAnswer->save();
        }
        $this->sendEmailResponse($token);
        return response()->json(self::LAST_RESPONSE, 200)->withCookie(Cookie::forget('token'));
    }

    public function index(Request $request, Question $question){
        $null_questions = $question
            ->where(function ($query) {
                $query->where('parent_item_id', '=', null);
            })->get();

        if($request->file("answer")){
            try{
                $fileList = "";
                foreach ($request->file("answer") as $file){
                    $file->move('./img/files', $file->getClientOriginalName());
                    $fileList .=$file->getClientOriginalName().";";
                }

                if($request->cookie("token")){
                    $ask  = $question->where("item_text", "=" ,$request->ask)->first();
                    $storeAnswer = new Answer();
                    $storeAnswer->user_token = $request->cookie("token");
                    $storeAnswer->question_id = $ask->id;
                    $storeAnswer->answer = $fileList;
                    $storeAnswer->save();
                }
            }catch (\Exception $e){

            }
            return $this->getNullQuestionResponse($question,$null_questions,$request->nullQuestion, $request->cookie("token"));
        }

        if(isset($request->answer) && ($request->type !== "input")){

            $parent = $question->where('item_text', '=', $request->answer)->first();

            if(!empty($parent)){
                $questions = $question->where('parent_item_id', '=', $parent->id)->get();

                if(count($questions) !== 0){
                    return response()->json(array(
                        'code'      => 200,
                        'ask'   => $questions[0]->item_text,
                        'type' => $question->type,
                        'type_input' => $null_questions[$request->nullQuestion]->input_type,
                        "nullQuestion" => $request->nullQuestion
                    ), 200);
                }
                else{
                    return $this->getNullQuestionResponse($question,$null_questions,$request->nullQuestion, $request->cookie("token"),$request->answer);
                }

            }else{
                if($request->cookie("token")){
                    $ask  = $question->where("item_text", "=" ,$request->ask)->first();
                    $storeAnswer = new Answer();
                    $storeAnswer->user_token = $request->cookie("token");
                    $storeAnswer->question_id = $ask->id;
                    $storeAnswer->answer = $request->answer;
                    $storeAnswer->save();
                }
                $this->sendEmailResponse($request->cookie("token"));
                return response()->json(self::LAST_RESPONSE, 200)->withCookie(Cookie::forget('token'));
            }

        }else{
            return $this->getNullQuestionResponse($question,$null_questions,$request->nullQuestion, $request->cookie("token"),$request->answer);
        }

    }


    public function home(Request $request, Question $question){

        $request->session()->regenerate();
        $this->token  = md5(now().$request->session()->getId());
        $this->userCookie = cookie('token', $this->token, 7200);
        if(!$request->cookie("token")){
            return Response::view("welcome")->withCookie($this->userCookie);
        }else{
            return Response::view("welcome");
        }
    }

    public function sendEmailResponse($token){

        $questions= Answer::where("user_token", "=", $token)->get();

        $img =  Answer::where("user_token", "=", $token)->where("question_id", "=", 9)->first();

        if(empty($img)){
            $attach = [];
        }else{
            $imageList = explode(";", $img->answer);
            for ($i=0;$i<count($imageList);$i++){
                $attach[] = './img/files/'.$imageList[$i];
            }
        }

        $text = "
        <table>
            <tr>
                <td>Вопрос</td>
                <td>Ответ</td>
            </tr>
        ";
        foreach ($questions as $question) {
            $ask = Question::where("id", "=", $question->question_id)->first();
            $text .= "<tr><td>{$ask->item_text}</td><td>{$question->answer}</td></tr>";
        }
        $text.="</table>";

        $from = "noreply@avsweb.ru";
        $to = "qeepnettester@mail.ru";
        $subject = "Расчёт стоимости автомобиля";

// Заголовки письма === >>>
        $headers = "From: $from\r\n";
//$headers .= "To: $to\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "Date: " . date("r") . "\r\n";
        $headers .= "X-Mailer: zm php script\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative;\r\n";
        $baseboundary = "------------" . strtoupper(md5(uniqid(rand(), true)));
        $headers .= "  boundary=\"$baseboundary\"\r\n";
// <<< ====================

// Тело письма === >>>
        $message  =  "--$baseboundary\r\n";
        $message .= "Content-Type: text/plain;\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= "--$baseboundary\r\n";
        $newboundary = "------------" . strtoupper(md5(uniqid(rand(), true)));
        $message .= "Content-Type: multipart/related;\r\n";
        $message .= "  boundary=\"$newboundary\"\r\n\r\n\r\n";
        $message .= "--$newboundary\r\n";
        $message .= "Content-Type: text/html; charset=utf-8\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= $text . "\r\n\r\n";
// <<< ==============

// прикрепляем файлы ===>>>
        array_pop($attach);
        foreach($attach as $filename){
            $mimeType='image/png';
            $fileContent = file_get_contents($filename,true);
            $filename=basename($filename);
            $message.="--$newboundary\r\n";
            $message.="Content-Type: $mimeType;\r\n";
            $message.=" name=\"$filename\"\r\n";
            $message.="Content-Transfer-Encoding: base64\r\n";
            $message.="Content-ID: <$filename>\r\n";
            $message.="Content-Disposition: inline;\r\n";
            $message.=" filename=\"$filename\"\r\n\r\n";
            $message.=chunk_split(base64_encode($fileContent));
        }
// <<< ====================

// заканчиваем тело письма, дописываем разделители
        $message.="--$newboundary--\r\n\r\n";
        $message.="--$baseboundary--\r\n";

// отправка письма
        mail($to, $subject, $message , $headers);
        return;
    }
}
