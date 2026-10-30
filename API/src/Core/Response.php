<?php
// src/Core/Response.php

class Response {
    public static function json(mixed $data, int $code = 200): never {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, int $code = 400): never {
        self::json(['status' => 'error', 'message' => $message], $code);
    }

    public static function success(mixed $data = null, string $message = '', int $code = 200): never {
        $response = ['status' => 'success'];
        if (!empty($message)) {
            $response['message'] = $message;
        }
        if ($data !== null) {
            $response['data'] = $data;
        }
        self::json($response, $code);
    }
}